package com.rt.printerlibrary.utils;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Environment;
import android.os.Handler;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;

/* JADX INFO: loaded from: classes11.dex */
public class RTUtils {
    public static Bitmap compressImage(Bitmap bitmap, int i) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
        for (int i2 = 90; byteArrayOutputStream.toByteArray().length / 1024 > i && i2 > 0; i2 -= 10) {
            byteArrayOutputStream.reset();
            bitmap.compress(Bitmap.CompressFormat.JPEG, i2, byteArrayOutputStream);
        }
        return BitmapFactory.decodeStream(new ByteArrayInputStream(byteArrayOutputStream.toByteArray()), null, null);
    }

    /* JADX WARN: Removed duplicated region for block: B:55:0x0068 A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /* JADX WARN: Removed duplicated region for block: B:57:0x005e A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /* JADX WARN: Removed duplicated region for block: B:72:? A[SYNTHETIC] */
    /* JADX WARN: Unsupported multi-entry loop pattern (BACK_EDGE: B:39:0x0057 -> B:59:0x005a). Please report as a decompilation issue!!! */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public static void createFileWithByte(byte[] r2, java.lang.String r3) throws java.lang.Throwable {
        /*
            java.io.File r0 = new java.io.File
            java.io.File r1 = android.os.Environment.getExternalStorageDirectory()
            r0.<init>(r1, r3)
            r3 = 0
            boolean r1 = r0.exists()     // Catch: java.lang.Throwable -> L3e java.lang.Exception -> L41
            if (r1 == 0) goto L13
            r0.delete()     // Catch: java.lang.Throwable -> L3e java.lang.Exception -> L41
        L13:
            r0.createNewFile()     // Catch: java.lang.Throwable -> L3e java.lang.Exception -> L41
            java.io.FileOutputStream r1 = new java.io.FileOutputStream     // Catch: java.lang.Throwable -> L3e java.lang.Exception -> L41
            r1.<init>(r0)     // Catch: java.lang.Throwable -> L3e java.lang.Exception -> L41
            java.io.BufferedOutputStream r0 = new java.io.BufferedOutputStream     // Catch: java.lang.Throwable -> L36 java.lang.Exception -> L3a
            r0.<init>(r1)     // Catch: java.lang.Throwable -> L36 java.lang.Exception -> L3a
            r0.write(r2)     // Catch: java.lang.Throwable -> L32 java.lang.Exception -> L34
            r0.flush()     // Catch: java.lang.Throwable -> L32 java.lang.Exception -> L34
            r1.close()     // Catch: java.io.IOException -> L2a
            goto L2e
        L2a:
            r2 = move-exception
            r2.printStackTrace()
        L2e:
            r0.close()     // Catch: java.lang.Exception -> L56
            goto L5a
        L32:
            r2 = move-exception
            goto L38
        L34:
            r2 = move-exception
            goto L3c
        L36:
            r2 = move-exception
            r0 = r3
        L38:
            r3 = r1
            goto L5c
        L3a:
            r2 = move-exception
            r0 = r3
        L3c:
            r3 = r1
            goto L43
        L3e:
            r2 = move-exception
            r0 = r3
            goto L5c
        L41:
            r2 = move-exception
            r0 = r3
        L43:
            r2.printStackTrace()     // Catch: java.lang.Throwable -> L5b
            if (r3 == 0) goto L50
            r3.close()     // Catch: java.io.IOException -> L4c
            goto L50
        L4c:
            r2 = move-exception
            r2.printStackTrace()
        L50:
            if (r0 == 0) goto L5a
            r0.close()     // Catch: java.lang.Exception -> L56
            goto L5a
        L56:
            r2 = move-exception
            r2.printStackTrace()
        L5a:
            return
        L5b:
            r2 = move-exception
        L5c:
            if (r3 == 0) goto L66
            r3.close()     // Catch: java.io.IOException -> L62
            goto L66
        L62:
            r3 = move-exception
            r3.printStackTrace()
        L66:
            if (r0 == 0) goto L70
            r0.close()     // Catch: java.lang.Exception -> L6c
            goto L70
        L6c:
            r3 = move-exception
            r3.printStackTrace()
        L70:
            throw r2
        */
        throw new UnsupportedOperationException("Method not decompiled: com.rt.printerlibrary.utils.RTUtils.createFileWithByte(byte[], java.lang.String):void");
    }

    public static String getVersionName(Context context) {
        try {
            return context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return "";
        }
    }

    public static void saveFile(String str, String str2) {
        StringBuilder sb;
        File downloadCacheDirectory;
        if (Environment.getExternalStorageState().equals("mounted")) {
            sb = new StringBuilder();
            downloadCacheDirectory = Environment.getExternalStorageDirectory();
        } else {
            sb = new StringBuilder();
            downloadCacheDirectory = Environment.getDownloadCacheDirectory();
        }
        try {
            File file = new File(sb.append(downloadCacheDirectory.toString()).append(File.separator).append(str2).append(".txt").toString());
            if (!file.exists()) {
                new File(file.getParent()).mkdirs();
                file.createNewFile();
            }
            FileOutputStream fileOutputStream = new FileOutputStream(file);
            fileOutputStream.write(str.getBytes());
            fileOutputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void showProgress(Context context, String str, long j) {
        final ProgressDialog progressDialog = new ProgressDialog(context, 3);
        progressDialog.setMessage(str);
        progressDialog.show();
        new Handler().postDelayed(new Runnable() { // from class: com.rt.printerlibrary.utils.RTUtils.1
            @Override // java.lang.Runnable
            public void run() {
                progressDialog.dismiss();
            }
        }, j);
    }
}
