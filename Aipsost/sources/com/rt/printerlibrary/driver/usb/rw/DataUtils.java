package com.rt.printerlibrary.driver.usb.rw;

import java.util.Locale;
import java.util.Random;
import kotlin.UByte;

/* JADX INFO: loaded from: classes11.dex */
public class DataUtils {
    public static void blackWhiteReverse(byte[] bArr) {
        for (int i = 0; i < bArr.length; i++) {
            bArr[i] = (byte) (~(bArr[i] & UByte.MAX_VALUE));
        }
    }

    public static byte[] byteArraysToBytes(byte[][] bArr) {
        int length = 0;
        for (byte[] bArr2 : bArr) {
            length += bArr2.length;
        }
        byte[] bArr3 = new byte[length];
        int i = 0;
        for (byte[] bArr4 : bArr) {
            int i2 = 0;
            while (true) {
                if (i2 < bArr4.length) {
                    bArr3[i] = bArr4[i2];
                    i2++;
                    i++;
                }
            }
        }
        return bArr3;
    }

    public static String byteToStr(byte b) {
        String upperCase = Integer.toHexString(b & UByte.MAX_VALUE).toUpperCase(Locale.getDefault());
        return upperCase.length() == 1 ? "0" + upperCase : upperCase;
    }

    public static boolean bytesEquals(byte[] bArr, byte[] bArr2) {
        if (bArr == null && bArr2 == null) {
            return true;
        }
        if (bArr == null || bArr2 == null || bArr.length != bArr2.length) {
            return false;
        }
        for (int i = 0; i < bArr.length; i++) {
            if (bArr[i] != bArr2[i]) {
                return false;
            }
        }
        return true;
    }

    public static String bytesToStr(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < bArr.length; i++) {
            String upperCase = Integer.toHexString(bArr[i] & UByte.MAX_VALUE).toUpperCase(Locale.getDefault());
            if (upperCase.length() == 1) {
                upperCase = "0" + upperCase;
            }
            sb.append(upperCase);
            sb.append(i % 16 != 15 ? " " : "\r\n");
        }
        return sb.toString();
    }

    public static byte bytesToXor(byte[] bArr, int i, int i2) {
        if (i2 == 0) {
            return (byte) 0;
        }
        if (i2 == 1) {
            return bArr[i];
        }
        int i3 = bArr[i] ^ bArr[i + 1];
        for (int i4 = i + 2; i4 < i + i2; i4++) {
            i3 ^= bArr[i4];
        }
        return (byte) i3;
    }

    public static char[] bytestochars(byte[] bArr) {
        int length = bArr.length;
        char[] cArr = new char[length];
        for (int i = 0; i < length; i++) {
            cArr[i] = (char) (bArr[i] & UByte.MAX_VALUE);
        }
        return cArr;
    }

    public static byte[] cloneBytes(byte[] bArr) {
        byte[] bArr2 = new byte[bArr.length];
        for (int i = 0; i < bArr.length; i++) {
            bArr2[i] = bArr[i];
        }
        return bArr2;
    }

    public static void copyBytes(byte[] bArr, int i, byte[] bArr2, int i2, int i3) {
        for (int i4 = 0; i4 < i3; i4++) {
            bArr2[i2 + i4] = bArr[i + i4];
        }
    }

    public static byte[] getRandomByteArray(int i) {
        byte[] bArr = new byte[i];
        Random random = new Random(System.currentTimeMillis());
        for (int i2 = 0; i2 < i; i2++) {
            bArr[i2] = (byte) random.nextInt(256);
        }
        return bArr;
    }

    public static byte[] getSubBytes(byte[] bArr, int i, int i2) {
        byte[] bArr2 = new byte[i2];
        for (int i3 = 0; i3 < i2; i3++) {
            bArr2[i3] = bArr[i3 + i];
        }
        return bArr2;
    }
}
