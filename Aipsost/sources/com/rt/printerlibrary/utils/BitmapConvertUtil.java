package com.rt.printerlibrary.utils;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.net.Uri;
import android.util.Base64;
import android.util.Log;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.core.view.MotionEventCompat;
import androidx.recyclerview.widget.ItemTouchHelper;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.google.android.gms.location.LocationRequest;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.messaging.ServiceStarter;
import java.io.ByteArrayOutputStream;
import java.util.zip.DeflaterOutputStream;
import kotlin.UByte;
import kotlin.jvm.internal.ByteCompanionObject;
import kotlinx.coroutines.scheduling.WorkQueueKt;

/* JADX INFO: loaded from: classes11.dex */
public class BitmapConvertUtil {
    private static int[][] a = {new int[]{0, 128, 32, 160, 8, 136, 40, 168, 2, 130, 34, 162, 10, 138, 42, 170}, new int[]{192, 64, 224, 96, ItemTouchHelper.Callback.DEFAULT_DRAG_ANIMATION_DURATION, 72, 232, 104, 194, 66, 226, 98, 202, 74, 234, 106}, new int[]{48, 176, 16, 144, 56, 184, 24, 152, 50, 178, 18, 146, 58, 186, 26, 154}, new int[]{240, 112, 208, 80, 248, 120, 216, 88, 242, 114, 210, 82, ItemTouchHelper.Callback.DEFAULT_SWIPE_ANIMATION_DURATION, 122, 218, 90}, new int[]{12, 140, 44, 172, 4, 132, 36, 164, 14, 142, 46, 174, 6, 134, 38, 166}, new int[]{204, 76, 236, AppCompatDelegate.FEATURE_SUPPORT_ACTION_BAR, 196, 68, 228, 100, 206, 78, 238, 110, 198, 70, 230, 102}, new int[]{60, 188, 28, 156, 52, 180, 20, 148, 62, 190, 30, 158, 54, 182, 22, 150}, new int[]{252, 124, 220, 92, 244, 116, 212, 84, 254, 126, 222, 94, 246, 118, 214, 86}, new int[]{3, 131, 35, 163, 11, 139, 43, 171, 1, 129, 33, 161, 9, 137, 41, 169}, new int[]{195, 67, 227, 99, 203, 75, 235, 107, 193, 65, 225, 97, 201, 73, 233, LocationRequest.PRIORITY_NO_POWER}, new int[]{51, 179, 19, 147, 59, 187, 27, 155, 49, 177, 17, 145, 57, 185, 25, 153}, new int[]{243, 115, 211, 83, 251, 123, 219, 91, 241, 113, 209, 81, 249, 121, 217, 89}, new int[]{15, 143, 47, 175, 7, 135, 39, 167, 13, 141, 45, 173, 5, 133, 37, 165}, new int[]{207, 79, 239, 111, 199, 71, 231, 103, 205, 77, 237, AppCompatDelegate.FEATURE_SUPPORT_ACTION_BAR_OVERLAY, 197, 69, 229, 101}, new int[]{63, 191, 31, 159, 55, 183, 23, 151, 61, 189, 29, 157, 53, 181, 21, 149}, new int[]{254, WorkQueueKt.MASK, 223, 95, 247, 119, 215, 87, 253, 125, 221, 93, 245, 117, 213, 85}};

    private BitmapConvertUtil() {
        throw new UnsupportedOperationException("cannot be instantiated");
    }

    public static byte[] TSCSDK_bmpToDatas(Bitmap bitmap) {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inPurgeable = true;
        options.inPreferredConfig = Bitmap.Config.ARGB_8888;
        try {
            BitmapFactory.Options.class.getField("inNativeAlloc").setBoolean(options, true);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (IllegalArgumentException e2) {
            e2.printStackTrace();
        } catch (NoSuchFieldException e3) {
            e3.printStackTrace();
        } catch (SecurityException e4) {
            e4.printStackTrace();
        }
        Bitmap bitmapGray2Binary = gray2Binary(bitmap2Gray(bitmap));
        Integer.toString((bitmapGray2Binary.getWidth() + 7) / 8);
        Integer.toString(bitmapGray2Binary.getHeight());
        Integer.toString(0);
        byte[] bArr = new byte[((bitmapGray2Binary.getWidth() + 7) / 8) * bitmapGray2Binary.getHeight()];
        int width = (bitmapGray2Binary.getWidth() + 7) / 8;
        int width2 = bitmapGray2Binary.getWidth();
        int height = bitmapGray2Binary.getHeight();
        for (int i = 0; i < height * width; i++) {
            bArr[i] = -1;
        }
        for (int i2 = 0; i2 < height; i2++) {
            for (int i3 = 0; i3 < width2; i3++) {
                int pixel = bitmapGray2Binary.getPixel(i3, i2);
                int iRed = ((Color.red(pixel) + Color.green(pixel)) + Color.blue(pixel)) / 3;
                int i4 = (((width2 + 7) / 8) * i2) + (i3 / 8);
                if (iRed == 0) {
                    bArr[i4] = (byte) (bArr[i4] ^ ((byte) (128 >> (i3 % 8))));
                }
            }
        }
        return bArr;
    }

    private static String a(Context context, Uri uri) {
        if (FirebaseAnalytics.Param.CONTENT.equalsIgnoreCase(uri.getScheme())) {
            Cursor cursorQuery = context.getContentResolver().query(uri, new String[]{"_data"}, null, null, null);
            if (cursorQuery == null) {
                return null;
            }
            try {
                string = cursorQuery.moveToNext() ? cursorQuery.getString(cursorQuery.getColumnIndex("_data")) : null;
            } finally {
                cursorQuery.close();
            }
        }
        return "file".equalsIgnoreCase(uri.getScheme()) ? uri.getPath() : string;
    }

    private static byte[] a(Bitmap bitmap) {
        bitmap.getConfig().equals(Bitmap.Config.ARGB_8888);
        long jCurrentTimeMillis = System.currentTimeMillis();
        Log.d("BitmapConvertUtil", "Fu___sTime1111:" + jCurrentTimeMillis);
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        int[] iArr = new int[width * height];
        bitmap.getPixels(iArr, 0, width, 0, 0, width, height);
        int i = (width + 7) / 8;
        byte b = (byte) (255 >> (width % 8));
        byte[] bArr = new byte[i * height];
        byte[] bArr2 = {ByteCompanionObject.MIN_VALUE, 64, 32, PrinterCommands.DLE, 8, 4, 2, 1};
        int i2 = 0;
        while (i2 < height) {
            int i3 = 0;
            while (i3 < width) {
                int i4 = (width * i2) + i3;
                int i5 = (i * i2) + (i3 / 8);
                int i6 = i3 % 8;
                int i7 = iArr[i4];
                int i8 = width;
                int i9 = ((((((i7 & 16711680) >> 16) * 299) + (((i7 & MotionEventCompat.ACTION_POINTER_INDEX_MASK) >> 8) * 587)) + ((i7 & 255) * 114)) + ServiceStarter.ERROR_UNKNOWN) / 1000;
                iArr[i4] = i9;
                if ((i9 & 255) > a[i3 & 15][i2 & 15]) {
                    bArr[i5] = (byte) (bArr[i5] | bArr2[i6]);
                }
                i3++;
                width = i8;
            }
            i2++;
            int i10 = (i * i2) - 1;
            bArr[i10] = (byte) (bArr[i10] | b);
            width = width;
        }
        Log.d("BitmapConvertUtil", "Fu___sTime2222:" + System.currentTimeMillis());
        Log.d("BitmapConvertUtil", "Fu___Use_time:" + ((System.currentTimeMillis() - jCurrentTimeMillis) / 1000));
        return bArr;
    }

    public static Bitmap bitmap2Gray(Bitmap bitmap) {
        Bitmap bitmapCreateBitmap = Bitmap.createBitmap(bitmap.getWidth(), bitmap.getHeight(), Bitmap.Config.RGB_565);
        Canvas canvas = new Canvas(bitmapCreateBitmap);
        Paint paint = new Paint();
        ColorMatrix colorMatrix = new ColorMatrix();
        colorMatrix.setSaturation(0.0f);
        paint.setColorFilter(new ColorMatrixColorFilter(colorMatrix));
        canvas.drawBitmap(bitmap, 0.0f, 0.0f, paint);
        return bitmapCreateBitmap;
    }

    public static String bytesToHexStr(byte[] bArr) {
        StringBuffer stringBuffer = new StringBuffer(bArr.length);
        for (byte b : bArr) {
            String hexString = Integer.toHexString(b & UByte.MAX_VALUE);
            if (hexString.length() < 2) {
                stringBuffer.append(0);
            }
            stringBuffer.append(hexString.toLowerCase());
        }
        return stringBuffer.toString();
    }

    public static int calculateInsideInSampleSize(BitmapFactory.Options options, int i, int i2) {
        int i3;
        int i4 = options.outHeight;
        int i5 = options.outWidth;
        if (i5 > i && (i3 = i5 / i) > i4 / i2) {
            return i3;
        }
        if (i4 > i2) {
            return i4 / i2;
        }
        return 1;
    }

    public static byte[] convert(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        int[] iArr = new int[width * height];
        bitmap.getPixels(iArr, 0, width, 0, 0, width, height);
        int i = ((width - 1) / 8) + 1;
        byte[] bArr = new byte[i * height];
        for (int i2 = 0; i2 < height; i2++) {
            for (int i3 = 0; i3 < width; i3++) {
                int i4 = (i * i2) + (i3 / 8);
                int i5 = 7 - (i3 % 8);
                if ((iArr[(width * i2) + i3] & 255) < a[i2 & 15][i3 & 15]) {
                    bArr[i4] = (byte) (bArr[i4] | (1 << i5));
                }
            }
        }
        return bArr;
    }

    public static byte[] convert2(Bitmap bitmap) {
        return a(bitmap);
    }

    public static byte[] cpcl_convert(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        int[] iArr = new int[width * height];
        bitmap.getPixels(iArr, 0, width, 0, 0, width, height);
        int i = ((width - 1) / 8) + 1;
        byte[] bArr = new byte[i * height];
        for (int i2 = 0; i2 < height; i2++) {
            for (int i3 = 0; i3 < width; i3++) {
                int i4 = (i * i2) + (i3 / 8);
                int i5 = 7 - (i3 % 8);
                if ((iArr[(width * i2) + i3] & 255) < a[i2 & 15][i3 & 15]) {
                    bArr[i4] = (byte) (bArr[i4] | (1 << i5));
                }
            }
        }
        return bArr;
    }

    public static Bitmap decodeSampledBitmapFromBitmap(Bitmap bitmap, int i, int i2) {
        float f;
        Log.d("mydebug", "limitWidth=" + i);
        Log.d("mydebug", "limitHeight=" + i2);
        Log.e("mydebug", "bitmapWidth=" + bitmap.getWidth());
        Log.e("mydebug", "bitmapHeight=" + bitmap.getHeight());
        float width = i / bitmap.getWidth();
        float height = i2 / bitmap.getHeight();
        if (bitmap.getWidth() > i || bitmap.getHeight() > i2) {
            if (width >= height) {
                width = height;
            }
            f = width;
        } else {
            f = 1.0f;
        }
        Log.d("mydebug", "scaleSizeInvert=" + f);
        Matrix matrix = new Matrix();
        matrix.postScale(f, f);
        Bitmap bitmapCreateBitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
        Log.e("mydebug", "scale_bitmapWidth=" + bitmapCreateBitmap.getWidth());
        Log.e("mydebug", "scale_bitmapHeight=" + bitmapCreateBitmap.getHeight());
        return bitmapCreateBitmap;
    }

    public static Bitmap decodeSampledBitmapFromUri(Context context, Uri uri, int i, int i2) {
        String strA = a(context, uri);
        if (strA == null) {
            return null;
        }
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(strA, options);
        options.inSampleSize = calculateInsideInSampleSize(options, i, i2);
        options.inJustDecodeBounds = false;
        return BitmapFactory.decodeFile(strA, options);
    }

    public static byte[] getPinBmpPrintByte(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        Log.e("logolist============", " " + width + " " + height);
        int[] iArr = new int[width * height];
        bitmap.getPixels(iArr, 0, width, 0, 0, width, height);
        for (int i = 0; i < height; i++) {
            for (int i2 = 0; i2 < width; i2++) {
                int i3 = (width * i) + i2;
                int i4 = iArr[i3];
                iArr[i3] = ((int) (((((double) ((float) ((16711680 & i4) >> 16))) * 0.3d) + (((double) ((float) ((65280 & i4) >> 8))) * 0.59d)) + (((double) ((float) (i4 & 255))) * 0.11d))) <= 127 ? 0 : 255;
            }
        }
        for (int i5 = 0; i5 < height; i5++) {
            for (int i6 = 0; i6 < width; i6++) {
                int i7 = (i5 * width) + i6;
                if ((iArr[i7] & 255) > a[i6 & 15][i5 & 15]) {
                    iArr[i7] = 0;
                } else {
                    iArr[i7] = 1;
                }
            }
        }
        int i8 = ((height + 7) / 8) * 8;
        int i9 = ((width + 7) / 8) * 8;
        byte[] bArr = new byte[i8 * i9];
        byte[] bArr2 = {ByteCompanionObject.MIN_VALUE, 64, 32, PrinterCommands.DLE, 8, 4, 2, 1};
        for (int i10 = 0; i10 < i9; i10++) {
            int i11 = 0;
            while (i11 < i8) {
                int i12 = i11 + 8;
                try {
                    if (i12 < bitmap.getHeight()) {
                        for (int i13 = 0; i13 < 8; i13++) {
                            int width2 = ((i11 + i13) * bitmap.getWidth()) + i10;
                            int i14 = ((i11 / 8) * i9) + i10;
                            if (i10 < width && iArr[width2] == 1) {
                                bArr[i14] = (byte) (bArr[i14] | bArr2[i13]);
                            }
                        }
                    } else {
                        for (int i15 = 0; i15 < 8 - (i8 - bitmap.getHeight()); i15++) {
                            if (i10 < width && iArr[((i11 + i15) * bitmap.getWidth()) + i10] == 1) {
                                int i16 = ((i11 / 8) * i9) + i10;
                                iArr[i16] = iArr[i16] | bArr2[i15];
                            }
                        }
                    }
                    i11 = i12;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        return bArr;
    }

    public static Bitmap getSingleColorBitmap(Bitmap bitmap, int i) {
        int[] iArr = new int[bitmap.getWidth() * bitmap.getHeight()];
        boolean z = true;
        for (int i2 = 0; i2 < bitmap.getHeight(); i2++) {
            for (int i3 = 0; i3 < bitmap.getWidth(); i3++) {
                int width = (bitmap.getWidth() * i2) + i3;
                iArr[width] = -1;
                if (bitmap.getPixel(i3, i2) != i) {
                    iArr[width] = -16777216;
                    z = false;
                }
            }
        }
        if (z) {
            return null;
        }
        bitmap.setPixels(iArr, 0, bitmap.getWidth(), 0, 0, bitmap.getWidth(), bitmap.getHeight());
        return bitmap;
    }

    public static Bitmap gray2Binary(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        Bitmap bitmapCopy = bitmap.copy(Bitmap.Config.ARGB_8888, true);
        for (int i = 0; i < width; i++) {
            for (int i2 = 0; i2 < height; i2++) {
                int pixel = bitmapCopy.getPixel(i, i2);
                int i3 = (-16777216) & pixel;
                int i4 = 255;
                if (((int) ((((double) ((16711680 & pixel) >> 16)) * 0.3d) + (((double) ((65280 & pixel) >> 8)) * 0.59d) + (((double) (pixel & 255)) * 0.11d))) <= 180) {
                    i4 = 0;
                }
                bitmapCopy.setPixel(i, i2, (i4 << 16) | i3 | (i4 << 8) | i4);
            }
        }
        return bitmapCopy;
    }

    public static byte[] gray2bytes(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        Bitmap bitmapCopy = bitmap.copy(Bitmap.Config.ARGB_8888, true);
        byte[] bArr = new byte[width * height];
        for (int i = 0; i < width; i++) {
            for (int i2 = 0; i2 < height; i2++) {
                int pixel = bitmapCopy.getPixel(i, i2);
                int i3 = (-16777216) & pixel;
                int i4 = 255;
                if (((int) ((((double) ((16711680 & pixel) >> 16)) * 0.3d) + (((double) ((65280 & pixel) >> 8)) * 0.59d) + (((double) (pixel & 255)) * 0.11d))) <= 127) {
                    i4 = 0;
                }
                int i5 = (i4 << 16) | i3 | (i4 << 8) | i4;
                bArr[(i * i2) + i2] = (byte) i5;
                bitmapCopy.setPixel(i, i2, i5);
            }
        }
        return bArr;
    }

    public static String hexStr2Str(String str) {
        char[] charArray = str.toCharArray();
        int length = str.length() / 2;
        byte[] bArr = new byte[length];
        for (int i = 0; i < length; i++) {
            int i2 = i * 2;
            bArr[i] = (byte) ((("0123456789ABCDEF".indexOf(charArray[i2]) * 16) + "0123456789ABCDEF".indexOf(charArray[i2 + 1])) & 255);
        }
        return new String(bArr);
    }

    public static byte[] hs_bmpToDatas(Bitmap bitmap) {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inPurgeable = true;
        options.inPreferredConfig = Bitmap.Config.ARGB_8888;
        try {
            BitmapFactory.Options.class.getField("inNativeAlloc").setBoolean(options, true);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (IllegalArgumentException e2) {
            e2.printStackTrace();
        } catch (NoSuchFieldException e3) {
            e3.printStackTrace();
        } catch (SecurityException e4) {
            e4.printStackTrace();
        }
        Bitmap bitmapGray2Binary = gray2Binary(bitmap2Gray(bitmap));
        Integer.toString((bitmapGray2Binary.getWidth() + 7) / 8);
        Integer.toString(bitmapGray2Binary.getHeight());
        Integer.toString(0);
        byte[] bArr = new byte[((bitmapGray2Binary.getWidth() + 7) / 8) * bitmapGray2Binary.getHeight()];
        int width = (bitmapGray2Binary.getWidth() + 7) / 8;
        int width2 = bitmapGray2Binary.getWidth();
        int height = bitmapGray2Binary.getHeight();
        for (int i = 0; i < height; i++) {
            for (int i2 = 0; i2 < width2; i2++) {
                int pixel = bitmapGray2Binary.getPixel(i2, i);
                int iRed = ((Color.red(pixel) + Color.green(pixel)) + Color.blue(pixel)) / 3;
                int i3 = (((width2 + 7) / 8) * i) + (i2 / 8);
                if (iRed == 0) {
                    bArr[i3] = (byte) (bArr[i3] ^ ((byte) (128 >> (i2 % 8))));
                }
            }
        }
        return bArr;
    }

    public static Bitmap resizeBitmap(Bitmap bitmap, int i) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        if (width < i || width <= i) {
            return bitmap;
        }
        return Bitmap.createScaledBitmap(bitmap, i, (int) Math.floor(((double) height) / ((((double) width) * 1.0d) / ((double) i))), false);
    }

    public static Bitmap resizeBitmap(Bitmap bitmap, int i, int i2) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        if (width < i && height < i2) {
            return bitmap;
        }
        if (width > i) {
            height = (int) Math.floor(((double) height) / ((((double) width) * 1.0d) / ((double) i)));
            bitmap = Bitmap.createScaledBitmap(bitmap, i, height, false);
        } else {
            i = width;
        }
        return height > i2 ? Bitmap.createBitmap(bitmap, 0, 0, i, i2) : bitmap;
    }

    public static Bitmap scale(Bitmap bitmap, float f, float f2) {
        Matrix matrix = new Matrix();
        matrix.postScale(f, f2);
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
    }

    public static String zlibCompress(byte[] bArr) {
        try {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            DeflaterOutputStream deflaterOutputStream = new DeflaterOutputStream(byteArrayOutputStream);
            deflaterOutputStream.write(bArr);
            deflaterOutputStream.close();
            return Base64.encodeToString(byteArrayOutputStream.toByteArray(), 0);
        } catch (Exception e) {
            e.printStackTrace();
            return "ZIP_ERR";
        }
    }
}
