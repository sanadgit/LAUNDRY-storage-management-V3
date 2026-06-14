package com.rt.printerlibrary.utils;

import com.aipsoft.aipsoftconnect.Service.PrinterCommands;

/* JADX INFO: loaded from: classes11.dex */
public class FuncUtils {
    private static byte[][] a = {new byte[]{100, 56, 84, -126, 70, 34, 49, 98, 67, 119}, new byte[]{57, 73, 84, 67, 84, -126, 23, 55, -109, -120}, new byte[]{49, 87, 36, 85, 6, -120, 119, 4, 116, 66}, new byte[]{89, 22, -107, 85, 103, 25, -104, PrinterCommands.DLE, 80, -107}, new byte[]{41, 120, 100, 86, 7, -126, 82, 66, 7, 69}, new byte[]{68, 9, 71, 39, -106, 84, 73, 23, 70, 114}, new byte[]{70, 68, 23, 22, 88, 9, 121, -125, -122, 22}, new byte[]{117, -124, 22, 7, 68, -103, -125, 17, 70, 54}, new byte[]{116, -126, -105, 119, 119, -127, 7, 69, 50, 100}, new byte[]{18, -125, 57, 80, 8, 48, 66, 52, 7, -106}};

    public static String Byte2Hex(Byte b) {
        return String.format("%02x", b).toUpperCase();
    }

    public static String ByteArrToHex(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bArr) {
            sb.append(Byte2Hex(Byte.valueOf(b)));
            sb.append(" ");
        }
        return sb.toString();
    }

    public static String ByteArrToHex(byte[] bArr, int i, int i2) {
        StringBuilder sb = new StringBuilder();
        while (i < i2) {
            sb.append(Byte2Hex(Byte.valueOf(bArr[i])));
            i++;
        }
        return sb.toString();
    }

    public static byte HexToByte(String str) {
        return (byte) Integer.parseInt(str, 16);
    }

    public static byte[] HexToByteArr(String str) {
        byte[] bArr;
        int length = str.length();
        if (isOdd(length) == 1) {
            length++;
            bArr = new byte[length / 2];
            str = "0" + str;
        } else {
            bArr = new byte[length / 2];
        }
        int i = 0;
        int i2 = 0;
        while (i < length) {
            int i3 = i + 2;
            bArr[i2] = HexToByte(str.substring(i, i3));
            i2++;
            i = i3;
        }
        return bArr;
    }

    public static int HexToInt(String str) {
        return Integer.parseInt(str, 16);
    }

    public static byte getCode(int i, int i2) {
        return a[i][i2];
    }

    public static int isOdd(int i) {
        return i & 1;
    }
}
