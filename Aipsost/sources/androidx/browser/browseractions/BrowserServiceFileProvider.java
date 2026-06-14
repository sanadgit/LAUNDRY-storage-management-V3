package androidx.browser.browseractions;

import android.content.ClipData;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.ParcelFileDescriptor;
import android.util.Log;
import androidx.concurrent.futures.ResolvableFuture;
import androidx.core.content.FileProvider;
import androidx.core.util.AtomicFile;
import com.google.common.util.concurrent.ListenableFuture;
import java.io.File;
import java.io.FileDescriptor;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

/* JADX INFO: loaded from: classes.dex */
@Deprecated
public final class BrowserServiceFileProvider extends FileProvider {
    private static final String AUTHORITY_SUFFIX = ".image_provider";
    private static final String CLIP_DATA_LABEL = "image_provider_uris";
    private static final String CONTENT_SCHEME = "content";
    private static final String FILE_EXTENSION = ".png";
    private static final String FILE_SUB_DIR = "image_provider";
    private static final String FILE_SUB_DIR_NAME = "image_provider_images/";
    private static final String LAST_CLEANUP_TIME_KEY = "last_cleanup_time";
    private static final String TAG = "BrowserServiceFP";
    static Object sFileCleanupLock = new Object();

    private static class FileCleanupTask extends AsyncTask<Void, Void, Void> {
        private final Context mAppContext;
        private static final long IMAGE_RETENTION_DURATION = TimeUnit.DAYS.toMillis(7);
        private static final long CLEANUP_REQUIRED_TIME_SPAN = TimeUnit.DAYS.toMillis(7);
        private static final long DELETION_FAILED_REATTEMPT_DURATION = TimeUnit.DAYS.toMillis(1);

        FileCleanupTask(Context context) {
            this.mAppContext = context.getApplicationContext();
        }

        /* JADX INFO: Access modifiers changed from: protected */
        @Override // android.os.AsyncTask
        public Void doInBackground(Void... params) {
            long lastCleanUpTime;
            SharedPreferences prefs = this.mAppContext.getSharedPreferences(this.mAppContext.getPackageName() + BrowserServiceFileProvider.AUTHORITY_SUFFIX, 0);
            if (!shouldCleanUp(prefs)) {
                return null;
            }
            synchronized (BrowserServiceFileProvider.sFileCleanupLock) {
                boolean allFilesDeletedSuccessfully = true;
                File path = new File(this.mAppContext.getFilesDir(), BrowserServiceFileProvider.FILE_SUB_DIR);
                if (!path.exists()) {
                    return null;
                }
                File[] files = path.listFiles();
                long retentionDate = System.currentTimeMillis() - IMAGE_RETENTION_DURATION;
                for (File file : files) {
                    if (isImageFile(file)) {
                        long lastModified = file.lastModified();
                        if (lastModified < retentionDate && !file.delete()) {
                            Log.e(BrowserServiceFileProvider.TAG, "Fail to delete image: " + file.getAbsoluteFile());
                            allFilesDeletedSuccessfully = false;
                        }
                    }
                }
                if (allFilesDeletedSuccessfully) {
                    lastCleanUpTime = System.currentTimeMillis();
                } else {
                    long lastCleanUpTime2 = System.currentTimeMillis();
                    lastCleanUpTime = (lastCleanUpTime2 - CLEANUP_REQUIRED_TIME_SPAN) + DELETION_FAILED_REATTEMPT_DURATION;
                }
                SharedPreferences.Editor editor = prefs.edit();
                editor.putLong(BrowserServiceFileProvider.LAST_CLEANUP_TIME_KEY, lastCleanUpTime);
                editor.apply();
                return null;
            }
        }

        private static boolean isImageFile(File file) {
            String filename = file.getName();
            return filename.endsWith("..png");
        }

        private static boolean shouldCleanUp(SharedPreferences prefs) {
            long lastCleanup = prefs.getLong(BrowserServiceFileProvider.LAST_CLEANUP_TIME_KEY, System.currentTimeMillis());
            return System.currentTimeMillis() > CLEANUP_REQUIRED_TIME_SPAN + lastCleanup;
        }
    }

    private static class FileSaveTask extends AsyncTask<String, Void, Void> {
        private final Context mAppContext;
        private final Bitmap mBitmap;
        private final Uri mFileUri;
        private final String mFilename;
        private final ResolvableFuture<Uri> mResultFuture;

        FileSaveTask(Context context, String filename, Bitmap bitmap, Uri fileUri, ResolvableFuture<Uri> resultFuture) {
            this.mAppContext = context.getApplicationContext();
            this.mFilename = filename;
            this.mBitmap = bitmap;
            this.mFileUri = fileUri;
            this.mResultFuture = resultFuture;
        }

        /* JADX INFO: Access modifiers changed from: protected */
        @Override // android.os.AsyncTask
        public Void doInBackground(String... params) {
            saveFileIfNeededBlocking();
            return null;
        }

        /* JADX INFO: Access modifiers changed from: protected */
        @Override // android.os.AsyncTask
        public void onPostExecute(Void result) {
            new FileCleanupTask(this.mAppContext).executeOnExecutor(AsyncTask.SERIAL_EXECUTOR, new Void[0]);
        }

        private void saveFileIfNeededBlocking() {
            File path = new File(this.mAppContext.getFilesDir(), BrowserServiceFileProvider.FILE_SUB_DIR);
            synchronized (BrowserServiceFileProvider.sFileCleanupLock) {
                if (!path.exists() && !path.mkdir()) {
                    this.mResultFuture.setException(new IOException("Could not create file directory."));
                    return;
                }
                File img = new File(path, this.mFilename + BrowserServiceFileProvider.FILE_EXTENSION);
                if (img.exists()) {
                    this.mResultFuture.set(this.mFileUri);
                } else {
                    saveFileBlocking(img);
                }
                img.setLastModified(System.currentTimeMillis());
            }
        }

        private void saveFileBlocking(File img) {
            FileOutputStream fOut = null;
            if (Build.VERSION.SDK_INT >= 22) {
                AtomicFile atomicFile = new AtomicFile(img);
                try {
                    fOut = atomicFile.startWrite();
                    this.mBitmap.compress(Bitmap.CompressFormat.PNG, 100, fOut);
                    fOut.close();
                    atomicFile.finishWrite(fOut);
                    this.mResultFuture.set(this.mFileUri);
                    return;
                } catch (IOException e) {
                    atomicFile.failWrite(fOut);
                    this.mResultFuture.setException(e);
                    return;
                }
            }
            try {
                FileOutputStream fOut2 = new FileOutputStream(img);
                this.mBitmap.compress(Bitmap.CompressFormat.PNG, 100, fOut2);
                fOut2.close();
                this.mResultFuture.set(this.mFileUri);
            } catch (IOException e2) {
                this.mResultFuture.setException(e2);
            }
        }
    }

    public static ResolvableFuture<Uri> saveBitmap(Context context, Bitmap bitmap, String name, int version) {
        String filename = name + "_" + Integer.toString(version);
        Uri uri = generateUri(context, filename);
        ResolvableFuture<Uri> result = ResolvableFuture.create();
        new FileSaveTask(context, filename, bitmap, uri, result).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, new String[0]);
        return result;
    }

    private static Uri generateUri(Context context, String filename) {
        String fileName = FILE_SUB_DIR_NAME + filename + FILE_EXTENSION;
        return new Uri.Builder().scheme("content").authority(context.getPackageName() + AUTHORITY_SUFFIX).path(fileName).build();
    }

    public static void grantReadPermission(Intent intent, List<Uri> uris, Context context) {
        if (uris == null || uris.size() == 0) {
            return;
        }
        ContentResolver resolver = context.getContentResolver();
        intent.addFlags(1);
        ClipData clipData = ClipData.newUri(resolver, CLIP_DATA_LABEL, uris.get(0));
        for (int i = 1; i < uris.size(); i++) {
            clipData.addItem(new ClipData.Item(uris.get(i)));
        }
        intent.setClipData(clipData);
    }

    public static ListenableFuture<Bitmap> loadBitmap(final ContentResolver resolver, final Uri uri) {
        final ResolvableFuture<Bitmap> result = ResolvableFuture.create();
        AsyncTask.THREAD_POOL_EXECUTOR.execute(new Runnable() { // from class: androidx.browser.browseractions.BrowserServiceFileProvider.1
            @Override // java.lang.Runnable
            public void run() {
                try {
                    ParcelFileDescriptor descriptor = resolver.openFileDescriptor(uri, "r");
                    if (descriptor == null) {
                        result.setException(new FileNotFoundException());
                        return;
                    }
                    FileDescriptor fileDescriptor = descriptor.getFileDescriptor();
                    Bitmap bitmap = BitmapFactory.decodeFileDescriptor(fileDescriptor);
                    descriptor.close();
                    if (bitmap == null) {
                        result.setException(new IOException("File could not be decoded."));
                    } else {
                        result.set(bitmap);
                    }
                } catch (IOException e) {
                    result.setException(e);
                }
            }
        });
        return result;
    }
}
