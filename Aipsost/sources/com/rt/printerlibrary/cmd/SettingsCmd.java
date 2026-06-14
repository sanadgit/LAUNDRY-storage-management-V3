package com.rt.printerlibrary.cmd;

import android.net.wifi.ScanResult;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.rt.printerlibrary.enumerate.WiFiModeEnum;

/* JADX INFO: loaded from: classes11.dex */
public class SettingsCmd {

    /* JADX INFO: renamed from: com.rt.printerlibrary.cmd.SettingsCmd$1, reason: invalid class name */
    /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] a;

        static {
            int[] iArr = new int[WiFiModeEnum.values().length];
            a = iArr;
            try {
                iArr[WiFiModeEnum.STA.ordinal()] = 1;
            } catch (NoSuchFieldError e) {
            }
            try {
                a[WiFiModeEnum.AP.ordinal()] = 2;
            } catch (NoSuchFieldError e2) {
            }
        }
    }

    private static byte[] a(String str, byte b) {
        int i = 3;
        byte[] bArr = new byte[str.length() + 3 + 3 + 1];
        bArr[0] = PrinterCommands.US;
        bArr[1] = 119;
        bArr[2] = (byte) str.length();
        int i2 = 0;
        while (i2 < str.length()) {
            bArr[i] = (byte) str.charAt(i2);
            i2++;
            i++;
        }
        int i3 = i + 1;
        bArr[i] = 0;
        int i4 = i3 + 1;
        bArr[i3] = 0;
        int i5 = i4 + 1;
        bArr[i4] = 0;
        if (b == 0) {
            bArr[i5] = 0;
        } else {
            bArr[i5] = 1;
        }
        return bArr;
    }

    private static byte[] a(String str, String str2, byte b, byte b2) {
        int i;
        int i2 = 3;
        byte[] bArr = new byte[str.length() + 3 + 3 + str2.length() + 1];
        bArr[0] = PrinterCommands.US;
        bArr[1] = 119;
        bArr[2] = (byte) str.length();
        int i3 = 0;
        while (i3 < str.length()) {
            bArr[i2] = (byte) str.charAt(i3);
            i3++;
            i2++;
        }
        int i4 = i2 + 1;
        if (b2 == 0) {
            bArr[i2] = 0;
            i = i4 + 1;
            bArr[i4] = 1;
        } else {
            bArr[i2] = 1;
            i = i4 + 1;
            bArr[i4] = 0;
        }
        int i5 = i + 1;
        bArr[i] = (byte) str2.length();
        int i6 = 0;
        while (i6 < str2.length()) {
            bArr[i5] = (byte) str2.charAt(i6);
            i6++;
            i5++;
        }
        if (b == 0) {
            bArr[i5] = 0;
        } else {
            bArr[i5] = 1;
        }
        return bArr;
    }

    private static byte[] a(String str, String str2, byte b, byte b2, byte b3) {
        byte[] bArr = new byte[str.length() + 3 + 3 + str2.length() + 1];
        bArr[0] = PrinterCommands.US;
        bArr[1] = 119;
        bArr[2] = (byte) str.length();
        int i = 0;
        int i2 = 3;
        while (i < str.length()) {
            bArr[i2] = (byte) str.charAt(i);
            i++;
            i2++;
        }
        int i3 = i2 + 1;
        if (b2 == 0) {
            bArr[i2] = 2;
        } else {
            bArr[i2] = 3;
        }
        int i4 = i3 + 1;
        if (b3 == 0) {
            bArr[i3] = 1;
        } else {
            bArr[i3] = 0;
        }
        int i5 = i4 + 1;
        bArr[i4] = (byte) str2.length();
        int i6 = 0;
        while (i6 < str2.length()) {
            bArr[i5] = (byte) str2.charAt(i6);
            i6++;
            i5++;
        }
        if (b == 0) {
            bArr[i5] = 0;
        } else {
            bArr[i5] = 1;
        }
        return bArr;
    }

    public static byte[] setDhcp(boolean z) {
        byte[] bArr = new byte[4];
        bArr[0] = PrinterCommands.US;
        bArr[1] = 98;
        bArr[2] = 68;
        if (z) {
            bArr[3] = 1;
        } else {
            bArr[3] = 0;
        }
        return bArr;
    }

    public static byte[] setStaticIp(String str, String str2, String str3) {
        byte[] bArr = new byte[20];
        String[] strArrSplit = str.split("\\.");
        String[] strArrSplit2 = str2.split("\\.");
        String[] strArrSplit3 = str3.split("\\.");
        if (strArrSplit.length < 4 || strArrSplit2.length < 4 || strArrSplit3.length < 4) {
            return new byte[0];
        }
        bArr[0] = PrinterCommands.US;
        bArr[1] = 105;
        bArr[2] = (byte) Short.parseShort(strArrSplit[0]);
        bArr[3] = (byte) Short.parseShort(strArrSplit[1]);
        bArr[4] = (byte) Short.parseShort(strArrSplit[2]);
        bArr[5] = (byte) Short.parseShort(strArrSplit[3]);
        bArr[6] = PrinterCommands.US;
        bArr[7] = 37;
        bArr[8] = 0;
        bArr[9] = (byte) Short.parseShort(strArrSplit2[0]);
        bArr[10] = (byte) Short.parseShort(strArrSplit2[1]);
        bArr[11] = (byte) Short.parseShort(strArrSplit2[2]);
        bArr[12] = (byte) Short.parseShort(strArrSplit2[3]);
        bArr[13] = PrinterCommands.US;
        bArr[14] = 37;
        bArr[15] = 1;
        bArr[16] = (byte) Short.parseShort(strArrSplit3[0]);
        bArr[17] = (byte) Short.parseShort(strArrSplit3[1]);
        bArr[18] = (byte) Short.parseShort(strArrSplit3[2]);
        bArr[19] = (byte) Short.parseShort(strArrSplit3[3]);
        return bArr;
    }

    public static byte[] setWifiParam(ScanResult scanResult, String str, WiFiModeEnum wiFiModeEnum) {
        boolean z;
        int i;
        int i2;
        int i3;
        int i4 = 0;
        switch (AnonymousClass1.a[wiFiModeEnum.ordinal()]) {
            case 1:
            default:
                z = false;
                break;
            case 2:
                z = true;
                break;
        }
        String str2 = scanResult.SSID;
        String str3 = scanResult.SSID;
        if (!scanResult.capabilities.contains("WPA2-PSK")) {
            if (scanResult.capabilities.contains("WPA-PSK")) {
                if (scanResult.capabilities.contains("TKIP")) {
                    i = 0;
                    i4 = 1;
                    i2 = 0;
                    i3 = 1;
                } else {
                    i = 0;
                    i4 = 1;
                }
            } else if (scanResult.capabilities.contains("WEP")) {
                i = scanResult.capabilities.contains("SHARE") ? 1 : 0;
                i4 = 2;
            } else {
                i = 0;
            }
            i2 = 0;
            i3 = 0;
        } else if (scanResult.capabilities.contains("TKIP")) {
            i = 0;
            i4 = 1;
            i2 = 1;
            i3 = 1;
        } else {
            i = 0;
            i4 = 1;
            i2 = 1;
            i3 = 0;
        }
        if (str2 != null && str2.length() >= 0) {
            try {
                return !z ? a(str2, (byte) i4) : true == z ? a(str2, str, (byte) i4, (byte) i2, (byte) i3) : a(str2, str, (byte) i4, (byte) i);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }
}
