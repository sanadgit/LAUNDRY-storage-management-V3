package com.rt.printerlibrary.cmd;

import android.graphics.Bitmap;
import android.util.Log;
import androidx.exifinterface.media.ExifInterface;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.rt.printerlibrary.bean.LableSizeBean;
import com.rt.printerlibrary.bean.Position;
import com.rt.printerlibrary.enumerate.BarcodeStringPosition;
import com.rt.printerlibrary.enumerate.BarcodeType;
import com.rt.printerlibrary.enumerate.BmpPrintMode;
import com.rt.printerlibrary.enumerate.PrintDirection;
import com.rt.printerlibrary.enumerate.PrintRotation;
import com.rt.printerlibrary.enumerate.QrcodeEccLevel;
import com.rt.printerlibrary.enumerate.SettingEnum;
import com.rt.printerlibrary.enumerate.SpeedEnum;
import com.rt.printerlibrary.enumerate.TscFontTypeEnum;
import com.rt.printerlibrary.setting.BitmapSetting;
import com.rt.printerlibrary.setting.CommonSetting;
import com.rt.printerlibrary.setting.TextSetting;
import com.rt.printerlibrary.utils.BitmapConvertUtil;
import com.rt.printerlibrary.utils.BitmapUtil;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import kotlin.jvm.internal.ByteCompanionObject;

/* JADX INFO: loaded from: classes11.dex */
public class TscCmd extends Cmd {
    private static final String a = TscCmd.class.getSimpleName();
    private static final byte[] b = {18, 84};
    private static final byte[] c = "CLS\r\n".getBytes();
    private static final byte[] d = {10};
    private static final byte[] e = {PrinterCommands.CR};
    private static final byte[] f = {10, PrinterCommands.CR};
    private ArrayList<Byte> g = new ArrayList<>();
    private ArrayList<Byte> h = new ArrayList<>();
    private ArrayList<Byte> i = new ArrayList<>();
    private ArrayList<Byte> j = new ArrayList<>();

    /* JADX INFO: renamed from: com.rt.printerlibrary.cmd.TscCmd$1, reason: invalid class name */
    /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] a;
        static final /* synthetic */ int[] b;
        static final /* synthetic */ int[] c;
        static final /* synthetic */ int[] d;
        static final /* synthetic */ int[] e;
        static final /* synthetic */ int[] f;

        static {
            int[] iArr = new int[PrintDirection.values().length];
            f = iArr;
            try {
                iArr[PrintDirection.NORMAL.ordinal()] = 1;
            } catch (NoSuchFieldError e2) {
            }
            try {
                f[PrintDirection.REVERSE.ordinal()] = 2;
            } catch (NoSuchFieldError e3) {
            }
            int[] iArr2 = new int[TscFontTypeEnum.values().length];
            e = iArr2;
            try {
                iArr2[TscFontTypeEnum.Font_8x12_For_English_Number.ordinal()] = 1;
            } catch (NoSuchFieldError e4) {
            }
            try {
                e[TscFontTypeEnum.Font_12x20_For_English_Number.ordinal()] = 2;
            } catch (NoSuchFieldError e5) {
            }
            try {
                e[TscFontTypeEnum.Font_16x24_For_English_Number.ordinal()] = 3;
            } catch (NoSuchFieldError e6) {
            }
            try {
                e[TscFontTypeEnum.Font_24x32_For_English_Number.ordinal()] = 4;
            } catch (NoSuchFieldError e7) {
            }
            try {
                e[TscFontTypeEnum.Font_32x48_For_English_Number.ordinal()] = 5;
            } catch (NoSuchFieldError e8) {
            }
            try {
                e[TscFontTypeEnum.Font_14x19_For_English_Number.ordinal()] = 6;
            } catch (NoSuchFieldError e9) {
            }
            try {
                e[TscFontTypeEnum.Font_14x25_For_English_Number.ordinal()] = 7;
            } catch (NoSuchFieldError e10) {
            }
            try {
                e[TscFontTypeEnum.Font_21x27_For_English_Number.ordinal()] = 8;
            } catch (NoSuchFieldError e11) {
            }
            try {
                e[TscFontTypeEnum.Font_TST16_BF2_For_Traditional_Chinese.ordinal()] = 9;
            } catch (NoSuchFieldError e12) {
            }
            try {
                e[TscFontTypeEnum.Font_TST24_BF2_For_Traditional_Chinese.ordinal()] = 10;
            } catch (NoSuchFieldError e13) {
            }
            try {
                e[TscFontTypeEnum.Font_TTT24_BF2_For_Traditional_Chinese_TelcomCode.ordinal()] = 11;
            } catch (NoSuchFieldError e14) {
            }
            try {
                e[TscFontTypeEnum.Font_TSS12_BF2_For_Simple_Chinese.ordinal()] = 12;
            } catch (NoSuchFieldError e15) {
            }
            try {
                e[TscFontTypeEnum.Font_TSS16_BF2_For_Simple_Chinese.ordinal()] = 13;
            } catch (NoSuchFieldError e16) {
            }
            try {
                e[TscFontTypeEnum.Font_TSS24_BF2_For_Simple_Chinese.ordinal()] = 14;
            } catch (NoSuchFieldError e17) {
            }
            try {
                e[TscFontTypeEnum.Font_TSS32_BF2_For_Simple_Chinese.ordinal()] = 15;
            } catch (NoSuchFieldError e18) {
            }
            try {
                e[TscFontTypeEnum.Font_TSS48_BF2_For_Simple_Chinese.ordinal()] = 16;
            } catch (NoSuchFieldError e19) {
            }
            try {
                e[TscFontTypeEnum.Font_TSS64_BF2_For_Simple_Chinese.ordinal()] = 17;
            } catch (NoSuchFieldError e20) {
            }
            try {
                e[TscFontTypeEnum.Font_TSS72_BF2_For_Simple_Chinese.ordinal()] = 18;
            } catch (NoSuchFieldError e21) {
            }
            try {
                e[TscFontTypeEnum.Font_KS24_For_Korea.ordinal()] = 19;
            } catch (NoSuchFieldError e22) {
            }
            try {
                e[TscFontTypeEnum.Font_ARABIC_13.ordinal()] = 20;
            } catch (NoSuchFieldError e23) {
            }
            int[] iArr3 = new int[QrcodeEccLevel.values().length];
            d = iArr3;
            try {
                iArr3[QrcodeEccLevel.L.ordinal()] = 1;
            } catch (NoSuchFieldError e24) {
            }
            try {
                d[QrcodeEccLevel.M.ordinal()] = 2;
            } catch (NoSuchFieldError e25) {
            }
            try {
                d[QrcodeEccLevel.Q.ordinal()] = 3;
            } catch (NoSuchFieldError e26) {
            }
            try {
                d[QrcodeEccLevel.H.ordinal()] = 4;
            } catch (NoSuchFieldError e27) {
            }
            int[] iArr4 = new int[PrintRotation.values().length];
            c = iArr4;
            try {
                iArr4[PrintRotation.Rotate0.ordinal()] = 1;
            } catch (NoSuchFieldError e28) {
            }
            try {
                c[PrintRotation.Rotate90.ordinal()] = 2;
            } catch (NoSuchFieldError e29) {
            }
            try {
                c[PrintRotation.Rotate180.ordinal()] = 3;
            } catch (NoSuchFieldError e30) {
            }
            try {
                c[PrintRotation.Rotate270.ordinal()] = 4;
            } catch (NoSuchFieldError e31) {
            }
            int[] iArr5 = new int[BarcodeStringPosition.values().length];
            b = iArr5;
            try {
                iArr5[BarcodeStringPosition.NONE.ordinal()] = 1;
            } catch (NoSuchFieldError e32) {
            }
            int[] iArr6 = new int[BarcodeType.values().length];
            a = iArr6;
            try {
                iArr6[BarcodeType.UPC_A.ordinal()] = 1;
            } catch (NoSuchFieldError e33) {
            }
            try {
                a[BarcodeType.EAN13.ordinal()] = 2;
            } catch (NoSuchFieldError e34) {
            }
            try {
                a[BarcodeType.EAN8.ordinal()] = 3;
            } catch (NoSuchFieldError e35) {
            }
            try {
                a[BarcodeType.CODE39.ordinal()] = 4;
            } catch (NoSuchFieldError e36) {
            }
            try {
                a[BarcodeType.CODABAR.ordinal()] = 5;
            } catch (NoSuchFieldError e37) {
            }
            try {
                a[BarcodeType.CODE128.ordinal()] = 6;
            } catch (NoSuchFieldError e38) {
            }
            try {
                a[BarcodeType.ITF.ordinal()] = 7;
            } catch (NoSuchFieldError e39) {
            }
            try {
                a[BarcodeType.QR_CODE.ordinal()] = 8;
            } catch (NoSuchFieldError e40) {
            }
        }
    }

    private String a(PrintDirection printDirection) {
        String str;
        switch (AnonymousClass1.f[printDirection.ordinal()]) {
            case 1:
            default:
                str = "0";
                break;
            case 2:
                str = "1";
                break;
        }
        String str2 = str.equals("") ? "0" : str;
        StringBuffer stringBuffer = new StringBuffer();
        String[] strArr = new String[32];
        strArr[0] = "DIRECTION";
        strArr[1] = " ";
        strArr[2] = str2;
        strArr[3] = "\r\n";
        for (int i = 0; i < 4; i++) {
            stringBuffer.append(strArr[i]);
        }
        String string = stringBuffer.toString();
        arrayAddToList(string.getBytes(), this.h);
        return string;
    }

    private String a(String str, String str2) {
        StringBuffer stringBuffer = new StringBuffer();
        String[] strArr = new String[64];
        strArr[0] = "SIZE";
        strArr[1] = " ";
        strArr[2] = str;
        strArr[3] = " ";
        strArr[4] = "mm";
        strArr[5] = ",";
        strArr[6] = str2;
        strArr[7] = " ";
        strArr[8] = "mm";
        strArr[9] = "\r\n";
        for (int i = 0; i < 10; i++) {
            stringBuffer.append(strArr[i]);
        }
        String string = stringBuffer.toString();
        arrayAddToList(string.getBytes(), this.h);
        return string;
    }

    private void a(int i) {
        if (i != -1) {
            switch (i) {
                case 0:
                    arrayAddToList(new byte[]{PrinterCommands.US, PrinterCommands.ESC, PrinterCommands.US, ByteCompanionObject.MIN_VALUE, 4, 5, 6, 102}, this.h);
                    break;
                case 1:
                    arrayAddToList(new byte[]{PrinterCommands.US, PrinterCommands.ESC, PrinterCommands.US, ByteCompanionObject.MIN_VALUE, 4, 5, 6, 68}, this.h);
                    break;
            }
        }
    }

    private void a(SpeedEnum speedEnum) {
        if (speedEnum != SpeedEnum.SPEED_NOT_SET) {
            arrayAddToList((" SPEED " + speedEnum.value() + "\r\n").getBytes(), this.h);
        }
    }

    private byte[] a(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException {
        if (textSetting == null) {
            textSetting = new TextSetting();
        }
        String str3 = textSetting.getTxtPrintPosition().x + "";
        String str4 = textSetting.getTxtPrintPosition().y + "";
        String str5 = "1";
        switch (AnonymousClass1.e[textSetting.getTscFontTypeEnum().ordinal()]) {
            case 2:
                str5 = ExifInterface.GPS_MEASUREMENT_2D;
                break;
            case 3:
                str5 = ExifInterface.GPS_MEASUREMENT_3D;
                break;
            case 4:
                str5 = "4";
                break;
            case 5:
                str5 = "5";
                break;
            case 6:
                str5 = "6";
                break;
            case 7:
                str5 = "7";
                break;
            case 8:
                str5 = "8";
                break;
            case 9:
                str5 = "TST16.BF2";
                break;
            case 10:
                str5 = "TST24.BF2";
                break;
            case 11:
                str5 = "TT24.BF2";
                break;
            case 12:
                str5 = "TSS12.BF2";
                break;
            case 13:
                str5 = "TSS16.BF2";
                break;
            case 14:
                str5 = "TSS24.BF2";
                break;
            case 15:
                str5 = "TSS32.BF2";
                break;
            case 16:
                str5 = "TSS48.BF2";
                break;
            case 17:
                str5 = "TSS64.BF2";
                break;
            case 18:
                str5 = "TSS72.BF2";
                break;
            case 19:
                str5 = "K";
                break;
            case 20:
                str5 = "13";
                break;
        }
        if (textSetting.getBold() == SettingEnum.Enable) {
            str5 = str5 + "B";
        }
        String str6 = "0";
        switch (AnonymousClass1.c[textSetting.getPrintRotation().ordinal()]) {
            case 2:
                str6 = "90";
                break;
            case 3:
                str6 = "180";
                break;
            case 4:
                str6 = "270";
                break;
        }
        if (textSetting.getxMultiplication() > 8 || textSetting.getxMultiplication() < 0) {
            textSetting.setxMultiplication(1);
        }
        if (textSetting.getyMultiplication() > 8 || textSetting.getyMultiplication() < 0) {
            textSetting.setyMultiplication(1);
        }
        String str7 = textSetting.getxMultiplication() + "";
        String str8 = textSetting.getyMultiplication() + "";
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(((((((((((((((((((("TEXT") + " ") + str3) + ",") + str4) + ",") + "\"") + str5) + "\"") + ",") + str6) + ",") + str7) + ",") + str8) + ",") + "\"") + str.replaceAll(" ", "\b")) + "\"") + "\r\n");
        byte[] bytes = stringBuffer.toString().getBytes(str2);
        arrayAddToList(bytes, this.g);
        return bytes;
    }

    private byte[] a(String str, String str2, String str3, String str4, String str5, String str6, String str7, String str8, String str9) {
        StringBuffer stringBuffer = new StringBuffer();
        String[] strArr = new String[256];
        strArr[0] = "BARCODE";
        strArr[1] = " ";
        strArr[2] = str;
        strArr[3] = ",";
        strArr[4] = str2;
        strArr[5] = ",";
        strArr[6] = "\"";
        strArr[7] = str3;
        strArr[8] = "\"";
        strArr[9] = ",";
        strArr[10] = str4;
        strArr[11] = ",";
        strArr[12] = str5;
        strArr[13] = ",";
        strArr[14] = str6;
        strArr[15] = ",";
        strArr[16] = str7;
        strArr[17] = ",";
        strArr[18] = str8;
        strArr[19] = ",";
        strArr[20] = "\"";
        strArr[21] = str9;
        strArr[22] = "\"";
        strArr[23] = "\r\n";
        for (int i = 0; i < 24; i++) {
            stringBuffer.append(strArr[i]);
        }
        String string = stringBuffer.toString();
        Log.d(a, "cmd ====> " + string);
        byte[] bytes = string.getBytes();
        arrayAddToList(bytes, this.j);
        return bytes;
    }

    private byte[] a(String str, String str2, String str3, String str4, String str5, byte[] bArr) {
        StringBuffer stringBuffer = new StringBuffer();
        String[] strArr = new String[64];
        strArr[0] = "BITMAP";
        strArr[1] = " ";
        strArr[2] = str;
        strArr[3] = ",";
        strArr[4] = str2;
        strArr[5] = ",";
        strArr[6] = str3;
        strArr[7] = ",";
        strArr[8] = str4;
        strArr[9] = ",";
        strArr[10] = str5;
        strArr[11] = ",";
        for (int i = 0; i < 12; i++) {
            stringBuffer.append(strArr[i]);
        }
        arrayAddToList(stringBuffer.toString().getBytes(), this.i);
        arrayAddToList(bArr, this.i);
        arrayAddToList("\r\n".getBytes(), this.i);
        return listToArray(this.i);
    }

    private String b(String str, String str2) {
        StringBuffer stringBuffer = new StringBuffer();
        String[] strArr = new String[64];
        strArr[0] = "GAP";
        strArr[1] = " ";
        strArr[2] = str;
        strArr[3] = " ";
        strArr[4] = "mm";
        strArr[5] = ",";
        strArr[6] = str2;
        strArr[7] = " ";
        strArr[8] = "mm";
        strArr[9] = "\r\n";
        for (int i = 0; i < 10; i++) {
            stringBuffer.append(strArr[i]);
        }
        String string = stringBuffer.toString();
        arrayAddToList(string.getBytes(), this.h);
        return string;
    }

    private byte[] c(String str, String str2) {
        StringBuffer stringBuffer = new StringBuffer();
        String[] strArr = new String[64];
        strArr[0] = "PRINT";
        strArr[1] = " ";
        strArr[2] = str;
        strArr[3] = ",";
        strArr[4] = str2;
        strArr[5] = "\r\n";
        for (int i = 0; i < 6; i++) {
            stringBuffer.append(strArr[i]);
        }
        return stringBuffer.toString().getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getAllCutCmd() {
        return new byte[0];
    }

    /* JADX WARN: Removed duplicated region for block: B:36:0x00ae  */
    /* JADX WARN: Removed duplicated region for block: B:50:0x00eb  */
    @Override // com.rt.printerlibrary.cmd.Cmd
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public byte[] getBarcodeCmd(com.rt.printerlibrary.enumerate.BarcodeType r15, com.rt.printerlibrary.setting.BarcodeSetting r16, java.lang.String r17) throws com.rt.printerlibrary.exception.SdkException {
        /*
            Method dump skipped, instruction units count: 356
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.rt.printerlibrary.cmd.TscCmd.getBarcodeCmd(com.rt.printerlibrary.enumerate.BarcodeType, com.rt.printerlibrary.setting.BarcodeSetting, java.lang.String):byte[]");
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBeepCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBitmapCmd(BitmapSetting bitmapSetting, Bitmap bitmap) {
        this.i.clear();
        Position printPostion = bitmapSetting.getPrintPostion();
        int i = printPostion.x;
        int i2 = printPostion.y;
        int bimtapLimitWidth = bitmapSetting.getBimtapLimitWidth();
        if (bimtapLimitWidth != bitmap.getWidth()) {
            bitmap = BitmapConvertUtil.resizeBitmap(bitmap, bimtapLimitWidth);
        }
        int width = (bitmap.getWidth() + 7) / 8;
        int height = bitmap.getHeight();
        a(String.valueOf(i), String.valueOf(i2), String.valueOf(width), String.valueOf(height), "0", bitmapSetting.getBmpPrintMode() == BmpPrintMode.MODE_MULTI_COLOR ? new BitmapUtil().GetTscBitmapPrintCmd(bitmap) : BitmapConvertUtil.TSCSDK_bmpToDatas(bitmap));
        return listToArray(this.i);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCRCmd() {
        return e;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCommonSettingCmd(CommonSetting commonSetting) {
        String str;
        this.h.clear();
        LableSizeBean lableSizeBean = commonSetting.getLableSizeBean();
        if (lableSizeBean != null) {
            a(lableSizeBean.getLabelWidthInMM() + "", lableSizeBean.getLabelHeightInMM() + "");
            str = lableSizeBean.getLabelHeightInMM() + "";
        } else {
            str = "0";
        }
        b(String.valueOf(commonSetting.getLabelGap()), str);
        PrintDirection printDirection = commonSetting.getPrintDirection();
        if (printDirection != null) {
            a(printDirection);
        }
        a(commonSetting.getSpeedEnum());
        a(commonSetting.getBlackMarkSwitch());
        return listToArray(this.h);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCpclHeaderCmd(int i, int i2, int i3, int i4) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawBox(int i, int i2, int i3, int i4, int i5) {
        return (" BOX " + i + ", " + i2 + ", " + i3 + ", " + i4 + "," + i5 + "\r\n").getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawLine(int i, int i2, int i3, int i4, int i5) {
        int iAbs = Math.abs(i - i3);
        int iAbs2 = Math.abs(i2 - i4);
        if (i == i3) {
            iAbs = i5;
        }
        if (i2 != i4) {
            i5 = iAbs2;
        }
        return ("BAR " + i + ", " + i2 + ", " + iAbs + ", " + i5 + "\r\n").getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getEndCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHalfCutCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHeaderCmd() {
        return c;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getLFCRCmd() {
        return f;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getLFCmd() {
        return d;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getOpenMoneyBoxCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getPrintCopies(int i) {
        if (i < 1) {
            i = 1;
        }
        return c("1", i + "");
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getReverse(int i, int i2, int i3, int i4) {
        return ("REVERSE " + i + ", " + i2 + ", " + i3 + ", " + i4 + "\r\n").getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getSelfTestCmd() {
        return b;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getTextCmd(TextSetting textSetting, String str) throws UnsupportedEncodingException {
        this.g.clear();
        return a(textSetting, str, getChartsetName());
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getTextCmd(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException {
        this.g.clear();
        return a(textSetting, str, str2);
    }

    public void tscQRCODE(String str, String str2, String str3, String str4, String str5, String str6) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("QRCODE");
        stringBuffer.append(" ");
        stringBuffer.append(str);
        stringBuffer.append(",");
        stringBuffer.append(str2);
        stringBuffer.append(",");
        stringBuffer.append(str3);
        stringBuffer.append(",");
        stringBuffer.append(str4);
        stringBuffer.append(",");
        stringBuffer.append(ExifInterface.GPS_MEASUREMENT_IN_PROGRESS);
        stringBuffer.append(",");
        stringBuffer.append(str5);
        stringBuffer.append(",");
        stringBuffer.append("\"" + str6 + "\"");
        stringBuffer.append(",");
        stringBuffer.append("1");
        stringBuffer.append(",");
        stringBuffer.append(ExifInterface.GPS_MEASUREMENT_2D);
        stringBuffer.append("\r\n");
        arrayAddToList(stringBuffer.toString().getBytes(), this.j);
    }
}
