package com.rt.printerlibrary.utils;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Paint;
import android.graphics.Rect;
import androidx.core.view.MotionEventCompat;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.google.firebase.messaging.ServiceStarter;
import java.util.Random;
import kotlin.UByte;
import kotlin.jvm.internal.ByteCompanionObject;

/* JADX INFO: loaded from: classes11.dex */
public class BitmapUtil {

    private class BitmaHander {
        Bitmap a;

        BitmaHander(Bitmap bitmap) {
            this.a = bitmap;
        }

        private int[] b(int i) {
            Random random = new Random(System.currentTimeMillis());
            int[] iArr = new int[i];
            int[] iArr2 = new int[i];
            for (int i2 = 0; i2 < i; i2++) {
                iArr[i2] = i2;
            }
            for (int i3 = 0; i3 < i; i3++) {
                int i4 = i - i3;
                int iAbs = Math.abs(random.nextInt()) % i4;
                iArr2[i3] = iArr[iAbs];
                iArr[iAbs] = iArr[i4 - 1];
            }
            return iArr2;
        }

        private Weight[] b() {
            Weight[] weightArr = new Weight[66];
            for (int i = 0; i < 66; i++) {
                weightArr[i] = new Weight();
            }
            float[] fArr = {0.0f, 0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f, 1.0f};
            int i2 = 0;
            for (int i3 = 0; i3 <= 10; i3++) {
                for (int i4 = 0; i4 <= 10 - i3; i4++) {
                    weightArr[i2].a = fArr[i3];
                    weightArr[i2].b = fArr[i4];
                    weightArr[i2].c = fArr[10 - (i3 + i4)];
                    i2++;
                }
            }
            return weightArr;
        }

        byte a(int i) {
            if (i > 255) {
                return (byte) -1;
            }
            if (i < 0) {
                return (byte) 0;
            }
            return (byte) i;
        }

        byte a(TPicRegion tPicRegion, long j, long j2) {
            return tPicRegion.a[(int) ((tPicRegion.b * j2) + j)];
        }

        double a(double d) {
            if (d < 0.0d) {
                d = -d;
            }
            double d2 = d * d;
            double d3 = d2 * d;
            if (d <= 1.0d) {
                return ((((double) 1.0f) * d3) - (((double) 2.0f) * d2)) + 1.0d;
            }
            if (d <= 2.0d) {
                return (((((double) (-1.0f)) * d3) - (((double) (-5.0f)) * d2)) + (((double) (-8.0f)) * d)) - ((double) (-4.0f));
            }
            return 0.0d;
        }

        void a(int i, int i2, int[] iArr, byte[] bArr) {
            int i3;
            int i4 = i;
            int i5 = i2;
            double dSqrt = 1.0d / Math.sqrt(2.0d);
            float fSqrt = (float) (64.0d / Math.sqrt(i4 * i5));
            int i6 = (int) ((i5 * fSqrt) + 0.5f);
            int i7 = (int) ((fSqrt * i4) + 0.5f);
            Weight[] weightArrB = b();
            int i8 = i6 * i7;
            int[] iArrB = b(i8);
            RGB_Item[] rGB_ItemArr = new RGB_Item[i8];
            RGB_Item[] rGB_ItemArr2 = new RGB_Item[i8];
            for (int i9 = 0; i9 < i8; i9++) {
                rGB_ItemArr[i9] = new RGB_Item();
                rGB_ItemArr2[i9] = new RGB_Item();
            }
            int i10 = 0;
            while (true) {
                int i11 = 16711680;
                if (i10 >= i7) {
                    break;
                }
                int i12 = i10 * i6;
                int i13 = ((i10 * i4) / i7) * i5;
                int i14 = 0;
                while (i14 < i6) {
                    int i15 = iArr[i13 + ((i14 * i5) / i6)];
                    int i16 = (i15 & MotionEventCompat.ACTION_POINTER_INDEX_MASK) >> 8;
                    rGB_ItemArr[i12].a = (float) (((double) (i15 & 255)) * 0.00392156862745098d);
                    rGB_ItemArr[i12].b = (float) (((double) i16) * 0.00392156862745098d);
                    rGB_ItemArr[i12].c = (float) (((double) ((i15 & i11) >> 16)) * 0.00392156862745098d);
                    i12++;
                    i14++;
                    i5 = i2;
                    dSqrt = dSqrt;
                    i11 = 16711680;
                }
                i10++;
                i4 = i;
                i5 = i2;
            }
            double d = dSqrt;
            for (int i17 = 0; i17 < i7; i17++) {
                int i18 = i17 * i6;
                int i19 = i18;
                for (int i20 = 0; i20 < i6; i20++) {
                    int i21 = iArrB[i18 + i20];
                    rGB_ItemArr2[i19].a = rGB_ItemArr[i19].a - rGB_ItemArr[i21].a;
                    rGB_ItemArr2[i19].b = rGB_ItemArr[i19].b - rGB_ItemArr[i21].b;
                    rGB_ItemArr2[i19].c = rGB_ItemArr[i19].c - rGB_ItemArr[i21].c;
                    i19++;
                }
            }
            float[] fArr = new float[i8];
            for (int i22 = 0; i22 < i7; i22++) {
                int i23 = i22 * i6;
                int i24 = i23;
                for (int i25 = 0; i25 < i6; i25++) {
                    fArr[i23] = (float) (Math.sqrt((rGB_ItemArr2[i24].a * rGB_ItemArr2[i24].a) + (rGB_ItemArr2[i24].b * rGB_ItemArr2[i24].b) + (rGB_ItemArr2[i24].c * rGB_ItemArr2[i24].c)) * d);
                    i23++;
                    i24++;
                }
            }
            int i26 = i8 * 66;
            float[] fArr2 = new float[i26];
            int i27 = 0;
            while (true) {
                i3 = 66;
                if (i27 >= i8) {
                    break;
                }
                int i28 = i27 * 66;
                for (int i29 = 0; i29 < 66; i29++) {
                    fArr2[i28] = (rGB_ItemArr2[i27].a * weightArrB[i29].a) + (rGB_ItemArr2[i27].b * weightArrB[i29].b) + (rGB_ItemArr2[i27].c * weightArrB[i29].c);
                    i28++;
                }
                i27++;
            }
            float[] fArr3 = new float[i26];
            int i30 = 0;
            while (i30 < i8) {
                int i31 = i30 * 66;
                int i32 = 0;
                while (i32 < i3) {
                    int i33 = i31;
                    fArr3[i33] = (float) Math.log(Math.exp((-(r9 + r10)) * ((double) (fArr2[i31] + fArr[i30])) * 399.99998807907133d) + Math.exp((-(r13 - r14)) * ((double) (fArr2[i31] - fArr[i30])) * 399.99998807907133d));
                    i31 = i33 + 1;
                    i32++;
                    i3 = 66;
                }
                i30++;
                i3 = 66;
            }
            int i34 = 66;
            double[] dArr = new double[66];
            int i35 = 0;
            while (i35 < i34) {
                double d2 = 0.0d;
                int i36 = i35;
                int i37 = 0;
                while (i37 < i8) {
                    d2 += (double) fArr3[i36];
                    i36 += i34;
                    i37++;
                    i34 = 66;
                }
                dArr[i35] = d2 / ((double) i8);
                i35++;
                i34 = 66;
            }
            float f = -3.4028235E38f;
            int i38 = -1;
            for (int i39 = 0; i39 < 66; i39++) {
                double d3 = dArr[i39];
                if (d3 > f) {
                    f = (float) d3;
                    i38 = i39;
                }
            }
            if (-1 == i38) {
                i38 = 36;
            }
            int i40 = (int) (weightArrB[i38].a * 1000.0f);
            int i41 = (int) (weightArrB[i38].b * 1000.0f);
            int i42 = (int) (weightArrB[i38].c * 1000.0f);
            for (int i43 = 0; i43 < i; i43++) {
                for (int i44 = 0; i44 < i2; i44++) {
                    int i45 = (i43 * i2) + i44;
                    int i46 = iArr[i45];
                    bArr[i45] = (byte) ((((((i46 & 255) * i40) + (((i46 & MotionEventCompat.ACTION_POINTER_INDEX_MASK) >> 8) * i41)) + (((i46 & 16711680) >> 16) * i42)) + ServiceStarter.ERROR_UNKNOWN) / 1000);
                }
            }
        }

        void a(TPicRegion tPicRegion, float f, float f2, byte[] bArr, int i) {
            long j = (long) f;
            long j2 = (long) f2;
            byte[] bArr2 = new byte[16];
            float[] fArr = new float[4];
            float[] fArr2 = new float[4];
            if (j > f) {
                j--;
            }
            long j3 = j;
            if (j2 > f2) {
                j2--;
            }
            float f3 = f - j3;
            float f4 = f2 - j2;
            for (long j4 = 0; j4 < 4; j4++) {
                long j5 = 0;
                while (j5 < 4) {
                    bArr2[(int) ((j4 * 4) + j5)] = b(tPicRegion, (j3 - 1) + j5, (j2 - 1) + j4);
                    j5++;
                    j2 = j2;
                }
            }
            fArr[0] = (float) a(f3 + 1.0f);
            fArr[1] = (float) a(f3);
            fArr[2] = (float) a(1.0f - f3);
            fArr[3] = (float) a(2.0f - f3);
            fArr2[0] = (float) a(f4 + 1.0f);
            fArr2[1] = (float) a(f4);
            fArr2[2] = (float) a(1.0f - f4);
            fArr2[3] = (float) a(2.0f - f4);
            float f5 = 0.0f;
            for (long j6 = 0; j6 < 4; j6++) {
                float f6 = 0.0f;
                for (long j7 = 0; j7 < 4; j7++) {
                    f6 += fArr[(int) j7] * (bArr2[(int) ((j6 * 4) + j7)] & UByte.MAX_VALUE);
                }
                f5 += f6 * fArr2[(int) j6];
            }
            bArr[i] = a((int) (((double) f5) + 0.5d));
        }

        void a(TPicRegion tPicRegion, TPicRegion tPicRegion2) {
            long j = tPicRegion.c;
            byte[] bArr = tPicRegion.a;
            long j2 = 0;
            if (0 == tPicRegion.c || 0 == tPicRegion.d || 0 == tPicRegion2.c || 0 == tPicRegion2.d) {
                return;
            }
            long j3 = 0;
            int i = 0;
            while (j3 < tPicRegion.d) {
                float f = (float) ((((j3 + 0.4999999d) * tPicRegion2.d) / tPicRegion.d) - 0.5d);
                long j4 = j2;
                while (j4 < j) {
                    a(tPicRegion2, (float) ((((j4 + 0.4999999d) * tPicRegion2.c) / tPicRegion.c) - 0.5d), f, bArr, (int) (((long) i) + j4));
                    j4++;
                    f = f;
                }
                i = (int) (((long) i) + tPicRegion.b);
                j3++;
                j2 = 0;
            }
        }

        void a(byte[] bArr, byte[] bArr2, int i, int i2) {
            byte[] bArr3 = {ByteCompanionObject.MIN_VALUE, 64, 32, PrinterCommands.DLE, 8, 4, 2, 1};
            for (int i3 = 0; i3 < i; i3++) {
                for (int i4 = 0; i4 < i2; i4++) {
                    if (1 == bArr2[(i4 * i) + i3]) {
                        int i5 = ((i4 / 8) * i) + i3;
                        bArr[i5] = (byte) (bArr3[i4 % 8] | bArr[i5]);
                    }
                }
            }
        }

        byte[] a() {
            int width = this.a.getWidth();
            int height = this.a.getHeight();
            this.a.getRowBytes();
            int i = width * height;
            int[] iArr = new int[i];
            byte[] bArr = new byte[i];
            this.a.getPixels(iArr, 0, width, 0, 0, width, height);
            a(height, width, iArr, bArr);
            return bArr;
        }

        byte[] a(byte[] bArr, int i, int i2) {
            int i3 = (i + 7) >> 3;
            byte[] bArr2 = new byte[(i2 * i3) + 8];
            byte[] bArr3 = {ByteCompanionObject.MIN_VALUE, 64, 32, PrinterCommands.DLE, 8, 4, 2, 1};
            int[][] iArr = {new int[]{0, 48, 12, 60, 3, 51, 15, 63}, new int[]{32, 16, 44, 28, 35, 19, 47, 31}, new int[]{8, 56, 4, 52, 11, 59, 7, 55}, new int[]{40, 24, 36, 20, 43, 27, 39, 23}, new int[]{2, 50, 14, 62, 1, 49, 13, 61}, new int[]{34, 18, 46, 30, 33, 17, 45, 29}, new int[]{10, 58, 6, 54, 9, 57, 5, 53}, new int[]{42, 26, 38, 22, 41, 25, 37, 21}};
            for (int i4 = 0; i4 < i2; i4++) {
                for (int i5 = 0; i5 < i; i5++) {
                    if (((bArr[(i4 * i) + i5] & UByte.MAX_VALUE) >> 2) < iArr[i4 & 7][i5 & 7]) {
                        int i6 = (i4 * i3) + (i5 / 8) + 8;
                        bArr2[i6] = (byte) (bArr2[i6] | bArr3[i5 % 8]);
                    }
                }
            }
            return bArr2;
        }

        /* JADX WARN: Removed duplicated region for block: B:12:0x001d A[PHI: r4
  0x001d: PHI (r4v6 long) = (r4v0 long), (r4v4 long) binds: [B:11:0x001b, B:15:0x0025] A[DONT_GENERATE, DONT_INLINE]] */
        /* JADX WARN: Removed duplicated region for block: B:13:0x001f  */
        /* JADX WARN: Removed duplicated region for block: B:18:0x002e  */
        /* JADX WARN: Removed duplicated region for block: B:20:0x0037 A[ORIG_RETURN, RETURN] */
        /* JADX WARN: Removed duplicated region for block: B:22:? A[RETURN, SYNTHETIC] */
        /*
            Code decompiled incorrectly, please refer to instructions dump.
            To view partially-correct code enable 'Show inconsistent code' option in preferences
        */
        byte b(com.rt.printerlibrary.utils.BitmapUtil.TPicRegion r11, long r12, long r14) {
            /*
                r10 = this;
                r2 = 1
                r0 = 0
                r4 = 0
                int r6 = (r12 > r4 ? 1 : (r12 == r4 ? 0 : -1))
                if (r6 >= 0) goto Lc
                r6 = r4
            La:
                r8 = 0
                goto L19
            Lc:
                long r6 = r11.c
                int r8 = (r12 > r6 ? 1 : (r12 == r6 ? 0 : -1))
                if (r8 < 0) goto L16
                long r6 = r11.c
                long r6 = r6 - r2
                goto La
            L16:
                r6 = 1
                r6 = r12
                r8 = 1
            L19:
                int r9 = (r14 > r4 ? 1 : (r14 == r4 ? 0 : -1))
                if (r9 >= 0) goto L1f
            L1d:
                r8 = 0
                goto L2c
            L1f:
                long r4 = r11.d
                int r9 = (r14 > r4 ? 1 : (r14 == r4 ? 0 : -1))
                if (r9 < 0) goto L2b
                long r4 = r11.d
                long r2 = r4 - r2
                r4 = r2
                goto L1d
            L2b:
                r4 = r14
            L2c:
                if (r8 == 0) goto L35
                r0 = r10
                r1 = r11
                r2 = r6
                byte r0 = r0.a(r1, r2, r4)
            L35:
                if (r8 != 0) goto L38
                r0 = -1
            L38:
                return r0
            */
            throw new UnsupportedOperationException("Method not decompiled: com.rt.printerlibrary.utils.BitmapUtil.BitmaHander.b(com.rt.printerlibrary.utils.BitmapUtil$TPicRegion, long, long):byte");
        }

        byte[] b(byte[] bArr, int i, int i2) {
            int i3 = (i + 7) >> 3;
            int i4 = i2 * i3;
            byte[] bArr2 = new byte[i4];
            for (int i5 = 0; i5 < i4; i5++) {
                bArr2[i5] = -1;
            }
            byte[] bArr3 = {ByteCompanionObject.MIN_VALUE, 64, 32, PrinterCommands.DLE, 8, 4, 2, 1};
            int[][] iArr = {new int[]{0, 48, 12, 60, 3, 51, 15, 63}, new int[]{32, 16, 44, 28, 35, 19, 47, 31}, new int[]{8, 56, 4, 52, 11, 59, 7, 55}, new int[]{40, 24, 36, 20, 43, 27, 39, 23}, new int[]{2, 50, 14, 62, 1, 49, 13, 61}, new int[]{34, 18, 46, 30, 33, 17, 45, 29}, new int[]{10, 58, 6, 54, 9, 57, 5, 53}, new int[]{42, 26, 38, 22, 41, 25, 37, 21}};
            for (int i6 = 0; i6 < i2; i6++) {
                for (int i7 = 0; i7 < i; i7++) {
                    if (((bArr[(i6 * i) + i7] & UByte.MAX_VALUE) >> 2) < iArr[i6 & 7][i7 & 7]) {
                        int i8 = (i6 * i3) + (i7 / 8);
                        bArr2[i8] = (byte) (bArr2[i8] & ((byte) (~bArr3[i7 % 8])));
                    }
                }
            }
            return bArr2;
        }

        byte[] c(byte[] bArr, int i, int i2) {
            int i3 = (i + 7) >> 3;
            byte[] bArr2 = new byte[i2 * i3];
            byte[] bArr3 = {ByteCompanionObject.MIN_VALUE, 64, 32, PrinterCommands.DLE, 8, 4, 2, 1};
            int[][] iArr = {new int[]{0, 48, 12, 60, 3, 51, 15, 63}, new int[]{32, 16, 44, 28, 35, 19, 47, 31}, new int[]{8, 56, 4, 52, 11, 59, 7, 55}, new int[]{40, 24, 36, 20, 43, 27, 39, 23}, new int[]{2, 50, 14, 62, 1, 49, 13, 61}, new int[]{34, 18, 46, 30, 33, 17, 45, 29}, new int[]{10, 58, 6, 54, 9, 57, 5, 53}, new int[]{42, 26, 38, 22, 41, 25, 37, 21}};
            for (int i4 = 0; i4 < i2; i4++) {
                for (int i5 = 0; i5 < i; i5++) {
                    if (((bArr[(i4 * i) + i5] & UByte.MAX_VALUE) >> 2) < iArr[i4 & 7][i5 & 7]) {
                        int i6 = (i4 * i3) + (i5 / 8);
                        bArr2[i6] = (byte) (bArr2[i6] | bArr3[i5 % 8]);
                    }
                }
            }
            return bArr2;
        }

        byte[] d(byte[] bArr, int i, int i2) {
            int i3 = (i + 7) >> 3;
            byte[] bArr2 = new byte[i2 * i3];
            byte[] bArr3 = {ByteCompanionObject.MIN_VALUE, 64, 32, PrinterCommands.DLE, 8, 4, 2, 1};
            int[][] iArr = {new int[]{0, 48, 12, 60, 3, 51, 15, 63}, new int[]{32, 16, 44, 28, 35, 19, 47, 31}, new int[]{8, 56, 4, 52, 11, 59, 7, 55}, new int[]{40, 24, 36, 20, 43, 27, 39, 23}, new int[]{2, 50, 14, 62, 1, 49, 13, 61}, new int[]{34, 18, 46, 30, 33, 17, 45, 29}, new int[]{10, 58, 6, 54, 9, 57, 5, 53}, new int[]{42, 26, 38, 22, 41, 25, 37, 21}};
            for (int i4 = 0; i4 < i2; i4++) {
                for (int i5 = 0; i5 < i; i5++) {
                    if (((bArr[(i4 * i) + i5] & UByte.MAX_VALUE) >> 2) < iArr[i4 & 7][i5 & 7]) {
                        int i6 = (i4 * i3) + (i5 / 8);
                        bArr2[i6] = (byte) (bArr2[i6] | bArr3[i5 % 8]);
                    }
                }
            }
            return bArr2;
        }

        byte[] e(byte[] bArr, int i, int i2) {
            byte[] bArr2 = new byte[i * i2];
            byte[] bArr3 = {ByteCompanionObject.MIN_VALUE, 64, 32, PrinterCommands.DLE, 8, 4, 2, 1};
            int[][] iArr = {new int[]{0, 48, 12, 60, 3, 51, 15, 63}, new int[]{32, 16, 44, 28, 35, 19, 47, 31}, new int[]{8, 56, 4, 52, 11, 59, 7, 55}, new int[]{40, 24, 36, 20, 43, 27, 39, 23}, new int[]{2, 50, 14, 62, 1, 49, 13, 61}, new int[]{34, 18, 46, 30, 33, 17, 45, 29}, new int[]{10, 58, 6, 54, 9, 57, 5, 53}, new int[]{42, 26, 38, 22, 41, 25, 37, 21}};
            for (int i3 = 0; i3 < i2; i3++) {
                for (int i4 = 0; i4 < i; i4++) {
                    int i5 = (i3 * i) + i4;
                    if (((bArr[i5] & UByte.MAX_VALUE) >> 2) < iArr[i3 & 7][i4 & 7]) {
                        bArr2[i5] = 1;
                    }
                }
            }
            return bArr2;
        }

        byte[] f(byte[] bArr, int i, int i2) {
            int i3 = ((((((i2 + 7) / 8) * 8) / 8) + 2) / 3) * 3;
            int i4 = i3 * i;
            byte[] bArr2 = new byte[i4];
            a(bArr2, e(bArr, i, i2), i, i2);
            byte[] bArr3 = {PrinterCommands.CR, PrinterCommands.ESC, 74, PrinterCommands.CAN};
            byte[] bArr4 = {PrinterCommands.ESC, 42, 39, (byte) (i % 256), (byte) (i / 256)};
            int i5 = i3 / 3;
            byte[] bArr5 = new byte[i4 + 3 + (i5 * 9)];
            bArr5[0] = PrinterCommands.US;
            bArr5[1] = 68;
            bArr5[2] = 3;
            int i6 = 3;
            for (int i7 = 0; i7 < i5; i7++) {
                int i8 = 0;
                while (i8 < 5) {
                    bArr5[i6] = bArr4[i8];
                    i8++;
                    i6++;
                }
                for (int i9 = 0; i9 < i; i9++) {
                    int i10 = 0;
                    while (i10 < 3) {
                        bArr5[i6] = bArr2[(((i7 * 3) + i10) * i) + i9];
                        i10++;
                        i6++;
                    }
                }
                int i11 = 0;
                while (i11 < 4) {
                    bArr5[i6] = bArr3[i11];
                    i11++;
                    i6++;
                }
            }
            return bArr5;
        }
    }

    private class RGB_Item {
        float a;
        float b;
        float c;

        private RGB_Item() {
        }
    }

    private class TPicRegion {
        byte[] a;
        long b;
        long c;
        long d;

        private TPicRegion() {
        }
    }

    private class Weight {
        float a;
        float b;
        float c;

        private Weight() {
        }
    }

    public static Bitmap compressBitmap(Bitmap bitmap, int i) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        int i2 = (i * height) / width;
        Bitmap bitmapCreateBitmap = Bitmap.createBitmap(i, i2, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmapCreateBitmap);
        canvas.drawColor(-1);
        canvas.drawBitmap(bitmap, new Rect(0, 0, width, height), new Rect(0, 0, i, i2), (Paint) null);
        return bitmapCreateBitmap;
    }

    public static Bitmap convertGreyImgByFloyd(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        int i = width * height;
        int[] iArr = new int[i];
        bitmap.getPixels(iArr, 0, width, 0, 0, width, height);
        int[] iArr2 = new int[i];
        for (int i2 = 0; i2 < height; i2++) {
            for (int i3 = 0; i3 < width; i3++) {
                int i4 = (width * i2) + i3;
                iArr2[i4] = (iArr[i4] & 16711680) >> 16;
            }
        }
        for (int i5 = 0; i5 < height; i5++) {
            for (int i6 = 0; i6 < width; i6++) {
                int i7 = (width * i5) + i6;
                int i8 = iArr2[i7];
                if (i8 >= 128) {
                    iArr[i7] = -1;
                    i8 -= 255;
                } else {
                    iArr[i7] = -16777216;
                }
                int i9 = width - 1;
                if (i6 < i9 && i5 < height - 1) {
                    int i10 = i7 + 1;
                    int i11 = (i8 * 3) / 8;
                    iArr2[i10] = iArr2[i10] + i11;
                    int i12 = ((i5 + 1) * width) + i6;
                    iArr2[i12] = iArr2[i12] + i11;
                    int i13 = i12 + 1;
                    iArr2[i13] = iArr2[i13] + (i8 / 4);
                } else if (i6 == i9 && i5 < height - 1) {
                    int i14 = ((i5 + 1) * width) + i6;
                    iArr2[i14] = iArr2[i14] + ((i8 * 3) / 8);
                } else if (i6 < i9 && i5 == height - 1) {
                    int i15 = i7 + 1;
                    iArr2[i15] = iArr2[i15] + (i8 / 4);
                }
            }
        }
        Bitmap bitmapCreateBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
        bitmapCreateBitmap.setPixels(iArr, 0, width, 0, 0, width, height);
        return bitmapCreateBitmap;
    }

    public byte[] Get24PinBitmapPrintCmd(Bitmap bitmap) {
        BitmaHander bitmaHander = new BitmaHander(bitmap);
        return bitmaHander.f(bitmaHander.a(), bitmap.getWidth(), bitmap.getHeight());
    }

    public byte[] Get24PinTimesBitmapPrintCmd(Bitmap bitmap, float f) {
        BitmaHander bitmaHander = new BitmaHander(bitmap);
        byte[] bArrA = bitmaHander.a();
        TPicRegion tPicRegion = new TPicRegion();
        TPicRegion tPicRegion2 = new TPicRegion();
        tPicRegion.b = bitmap.getWidth();
        tPicRegion.c = bitmap.getWidth();
        tPicRegion.d = bitmap.getHeight();
        tPicRegion.a = bArrA;
        int i = (int) (tPicRegion.d * f);
        int i2 = (int) (tPicRegion.c * f);
        long j = i2;
        tPicRegion2.b = j;
        tPicRegion2.c = j;
        tPicRegion2.d = i;
        tPicRegion2.a = new byte[i * i2];
        bitmaHander.a(tPicRegion2, tPicRegion);
        return bitmaHander.f(tPicRegion2.a, i2, i);
    }

    public byte[] GetCpclBitmapPrintCmd(Bitmap bitmap) {
        BitmaHander bitmaHander = new BitmaHander(bitmap);
        return bitmaHander.d(bitmaHander.a(), bitmap.getWidth(), bitmap.getHeight());
    }

    public byte[] GetESCBitmapPrintCmd(Bitmap bitmap) {
        BitmaHander bitmaHander = new BitmaHander(bitmap);
        byte[] bArrA = bitmaHander.a(bitmaHander.a(), bitmap.getWidth(), bitmap.getHeight());
        int width = (bitmap.getWidth() + 7) >> 3;
        bArrA[0] = PrinterCommands.GS;
        bArrA[1] = 118;
        bArrA[2] = 48;
        bArrA[3] = 0;
        bArrA[4] = (byte) (width % 256);
        bArrA[5] = (byte) (width >> 8);
        bArrA[6] = (byte) (bitmap.getHeight() % 256);
        bArrA[7] = (byte) (bitmap.getHeight() >> 8);
        return bArrA;
    }

    public byte[] GetESCBitmapTimesPrintCmd(Bitmap bitmap, float f) {
        BitmaHander bitmaHander = new BitmaHander(bitmap);
        byte[] bArrA = bitmaHander.a();
        TPicRegion tPicRegion = new TPicRegion();
        TPicRegion tPicRegion2 = new TPicRegion();
        tPicRegion.b = bitmap.getWidth();
        tPicRegion.c = bitmap.getWidth();
        tPicRegion.d = bitmap.getHeight();
        tPicRegion.a = bArrA;
        int i = (int) (tPicRegion.d * f);
        int i2 = (int) (tPicRegion.c * f);
        long j = i2;
        tPicRegion2.b = j;
        tPicRegion2.c = j;
        tPicRegion2.d = i;
        tPicRegion2.a = new byte[i * i2];
        bitmaHander.a(tPicRegion2, tPicRegion);
        byte[] bArrA2 = bitmaHander.a(tPicRegion2.a, i2, i);
        int i3 = (i2 + 7) >> 3;
        bArrA2[0] = PrinterCommands.GS;
        bArrA2[1] = 118;
        bArrA2[2] = 48;
        bArrA2[3] = 0;
        bArrA2[4] = (byte) (i3 % 256);
        bArrA2[5] = (byte) (i3 >> 8);
        bArrA2[6] = (byte) (i % 256);
        bArrA2[7] = (byte) (i >> 8);
        return bArrA2;
    }

    public byte[] GetTscBitmapPrintCmd(Bitmap bitmap) {
        BitmaHander bitmaHander = new BitmaHander(bitmap);
        return bitmaHander.b(bitmaHander.a(), bitmap.getWidth(), bitmap.getHeight());
    }

    public byte[] GetZplBitmapPrintCmd(Bitmap bitmap) {
        BitmaHander bitmaHander = new BitmaHander(bitmap);
        return bitmaHander.c(bitmaHander.a(), bitmap.getWidth(), bitmap.getHeight());
    }

    public byte[] GetZplBitmapPrintCmdTimes(Bitmap bitmap, float f) {
        BitmaHander bitmaHander = new BitmaHander(bitmap);
        return bitmaHander.c(bitmaHander.a(), bitmap.getWidth(), bitmap.getHeight());
    }

    public Bitmap bitmap2Gray(Bitmap bitmap) {
        Bitmap bitmapCreateBitmap = Bitmap.createBitmap(bitmap.getWidth(), bitmap.getHeight(), Bitmap.Config.RGB_565);
        Canvas canvas = new Canvas(bitmapCreateBitmap);
        Paint paint = new Paint();
        ColorMatrix colorMatrix = new ColorMatrix();
        colorMatrix.setSaturation(0.0f);
        paint.setColorFilter(new ColorMatrixColorFilter(colorMatrix));
        canvas.drawBitmap(bitmap, 0.0f, 0.0f, paint);
        return bitmapCreateBitmap;
    }

    public byte[] escBitmapPrint(Bitmap bitmap, int i, int i2) {
        int pixel;
        Bitmap bitmapConvertGreyImgByFloyd = convertGreyImgByFloyd(bitmap.getWidth() > i ? bitmap2Gray(compressBitmap(bitmap, i)) : bitmap2Gray(bitmap));
        byte b = (byte) i2;
        if (b < 0 || b > 3) {
            b = 0;
        }
        int width = bitmapConvertGreyImgByFloyd.getWidth();
        int height = bitmapConvertGreyImgByFloyd.getHeight();
        int i3 = width % 8 != 0 ? (width / 8) + 1 : width / 8;
        byte[] bArr = {PrinterCommands.GS, 118, 48, b, (byte) (i3 % 256), (byte) (i3 / 256), (byte) (height % 256), (byte) (height / 256)};
        int i4 = i3 * height;
        byte[] bArr2 = new byte[i4];
        int i5 = 0;
        for (int i6 = 0; i6 < height; i6++) {
            int i7 = 0;
            while (i7 < i3) {
                byte b2 = 0;
                for (int i8 = 0; i8 < 8; i8++) {
                    int i9 = (i7 * 8) + i8;
                    if (i9 < width && (pixel = bitmapConvertGreyImgByFloyd.getPixel(i9, i6)) != -1 && pixel != 0) {
                        b2 = (byte) (((byte) (128 >> i8)) | b2);
                    }
                }
                bArr2[i5] = b2;
                i7++;
                i5++;
            }
        }
        byte[] bArr3 = new byte[8 + i4];
        System.arraycopy(bArr, 0, bArr3, 0, 8);
        System.arraycopy(bArr2, 0, bArr3, 8, i4);
        return bArr3;
    }
}
