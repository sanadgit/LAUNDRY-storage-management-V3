package com.rt.printerlibrary.cmd;

import android.graphics.Bitmap;
import android.text.TextUtils;
import androidx.exifinterface.media.ExifInterface;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.rt.printerlibrary.bean.Position;
import com.rt.printerlibrary.enumerate.BarcodeStringPosition;
import com.rt.printerlibrary.enumerate.BarcodeType;
import com.rt.printerlibrary.enumerate.CpclFontTypeEnum;
import com.rt.printerlibrary.enumerate.PrintRotation;
import com.rt.printerlibrary.enumerate.QrcodeEccLevel;
import com.rt.printerlibrary.enumerate.SettingEnum;
import com.rt.printerlibrary.enumerate.SpeedEnum;
import com.rt.printerlibrary.exception.SdkException;
import com.rt.printerlibrary.setting.BarcodeSetting;
import com.rt.printerlibrary.setting.BitmapSetting;
import com.rt.printerlibrary.setting.CommonSetting;
import com.rt.printerlibrary.setting.TextSetting;
import com.rt.printerlibrary.utils.BitmapConvertUtil;
import com.rt.printerlibrary.utils.BitmapUtil;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

/* JADX INFO: loaded from: classes11.dex */
public class CpclCmd extends Cmd {
    private ArrayList<Byte> f = new ArrayList<>();
    private ArrayList<Byte> g = new ArrayList<>();
    private ArrayList<Byte> h = new ArrayList<>();
    private ArrayList<Byte> i = new ArrayList<>();
    private static final byte[] a = {18, 84};
    private static final byte[] b = "!U1 BEGIN-PAGE\r\n".getBytes();
    private static final byte[] c = {10};
    private static final byte[] d = {PrinterCommands.CR};
    private static final byte[] e = {10, PrinterCommands.CR};
    public static String Lateral_Resolution = "200";
    public static String Vertical_Resolution = "200";

    /* JADX INFO: renamed from: com.rt.printerlibrary.cmd.CpclCmd$1, reason: invalid class name */
    /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] a;
        static final /* synthetic */ int[] b;
        static final /* synthetic */ int[] c;
        static final /* synthetic */ int[] d;

        static {
            int[] iArr = new int[CpclFontTypeEnum.values().length];
            d = iArr;
            try {
                iArr[CpclFontTypeEnum.Font_0.ordinal()] = 1;
            } catch (NoSuchFieldError e) {
            }
            try {
                d[CpclFontTypeEnum.Font_1.ordinal()] = 2;
            } catch (NoSuchFieldError e2) {
            }
            try {
                d[CpclFontTypeEnum.Font_2.ordinal()] = 3;
            } catch (NoSuchFieldError e3) {
            }
            try {
                d[CpclFontTypeEnum.Font_3.ordinal()] = 4;
            } catch (NoSuchFieldError e4) {
            }
            try {
                d[CpclFontTypeEnum.Font_4.ordinal()] = 5;
            } catch (NoSuchFieldError e5) {
            }
            try {
                d[CpclFontTypeEnum.Font_5.ordinal()] = 6;
            } catch (NoSuchFieldError e6) {
            }
            try {
                d[CpclFontTypeEnum.Font_6.ordinal()] = 7;
            } catch (NoSuchFieldError e7) {
            }
            try {
                d[CpclFontTypeEnum.Font_7.ordinal()] = 8;
            } catch (NoSuchFieldError e8) {
            }
            try {
                d[CpclFontTypeEnum.Font_Chinese_24x24.ordinal()] = 9;
            } catch (NoSuchFieldError e9) {
            }
            try {
                d[CpclFontTypeEnum.Font_Chinese_16x16_custom.ordinal()] = 10;
            } catch (NoSuchFieldError e10) {
            }
            int[] iArr2 = new int[QrcodeEccLevel.values().length];
            c = iArr2;
            try {
                iArr2[QrcodeEccLevel.L.ordinal()] = 1;
            } catch (NoSuchFieldError e11) {
            }
            try {
                c[QrcodeEccLevel.M.ordinal()] = 2;
            } catch (NoSuchFieldError e12) {
            }
            try {
                c[QrcodeEccLevel.Q.ordinal()] = 3;
            } catch (NoSuchFieldError e13) {
            }
            try {
                c[QrcodeEccLevel.H.ordinal()] = 4;
            } catch (NoSuchFieldError e14) {
            }
            int[] iArr3 = new int[PrintRotation.values().length];
            b = iArr3;
            try {
                iArr3[PrintRotation.Rotate0.ordinal()] = 1;
            } catch (NoSuchFieldError e15) {
            }
            try {
                b[PrintRotation.Rotate90.ordinal()] = 2;
            } catch (NoSuchFieldError e16) {
            }
            try {
                b[PrintRotation.Rotate180.ordinal()] = 3;
            } catch (NoSuchFieldError e17) {
            }
            try {
                b[PrintRotation.Rotate270.ordinal()] = 4;
            } catch (NoSuchFieldError e18) {
            }
            int[] iArr4 = new int[BarcodeType.values().length];
            a = iArr4;
            try {
                iArr4[BarcodeType.UPC_A.ordinal()] = 1;
            } catch (NoSuchFieldError e19) {
            }
            try {
                a[BarcodeType.EAN13.ordinal()] = 2;
            } catch (NoSuchFieldError e20) {
            }
            try {
                a[BarcodeType.EAN8.ordinal()] = 3;
            } catch (NoSuchFieldError e21) {
            }
            try {
                a[BarcodeType.CODE39.ordinal()] = 4;
            } catch (NoSuchFieldError e22) {
            }
            try {
                a[BarcodeType.CODABAR.ordinal()] = 5;
            } catch (NoSuchFieldError e23) {
            }
            try {
                a[BarcodeType.CODE128.ordinal()] = 6;
            } catch (NoSuchFieldError e24) {
            }
            try {
                a[BarcodeType.ITF.ordinal()] = 7;
            } catch (NoSuchFieldError e25) {
            }
            try {
                a[BarcodeType.QR_CODE.ordinal()] = 8;
            } catch (NoSuchFieldError e26) {
            }
        }
    }

    private void a(SpeedEnum speedEnum) {
        if (speedEnum != SpeedEnum.SPEED_NOT_SET) {
            arrayAddToList(("SPEED " + speedEnum.value() + "\n").getBytes(), this.g);
        }
    }

    private void a(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException {
        String str3;
        String str4;
        String str5;
        String str6;
        String str7;
        String str8 = textSetting.getTxtPrintPosition().x + "";
        String str9 = textSetting.getTxtPrintPosition().y + "";
        switch (textSetting.getAlign()) {
            case -1:
            default:
                str3 = "";
                break;
            case 0:
                str3 = "LEFT\n";
                break;
            case 1:
                str3 = "CENTER\n";
                break;
            case 2:
                str3 = "RIGHT\n";
                break;
        }
        if (!TextUtils.isEmpty(str3)) {
            arrayAddToList(str3.getBytes(), this.f);
        }
        SettingEnum bold = textSetting.getBold();
        if (SettingEnum.Enable == bold) {
            arrayAddToList(("SETBOLD 1\n").getBytes(), this.f);
        } else if (SettingEnum.Disable == bold) {
            arrayAddToList(("SETBOLD 0\n").getBytes(), this.f);
        }
        SettingEnum underline = textSetting.getUnderline();
        if (SettingEnum.Enable == underline) {
            arrayAddToList(("UNDERLINE ON\n").getBytes(), this.f);
        } else if (SettingEnum.Disable == underline) {
            arrayAddToList(("UNDERLINE OFF\n").getBytes(), this.f);
        }
        int cpclTextSpacing = textSetting.getCpclTextSpacing();
        if (cpclTextSpacing != -1) {
            arrayAddToList(("SETSP " + cpclTextSpacing + "\n").getBytes(), this.f);
        }
        switch (AnonymousClass1.d[textSetting.getCpclFontTypeEnum().ordinal()]) {
            case 1:
                str4 = "0";
                str5 = str4;
                break;
            case 2:
            default:
                str5 = "1";
                break;
            case 3:
                str4 = ExifInterface.GPS_MEASUREMENT_2D;
                str5 = str4;
                break;
            case 4:
                str4 = ExifInterface.GPS_MEASUREMENT_3D;
                str5 = str4;
                break;
            case 5:
                str4 = "4";
                str5 = str4;
                break;
            case 6:
                str4 = "5";
                str5 = str4;
                break;
            case 7:
                str4 = "6";
                str5 = str4;
                break;
            case 8:
                str4 = "7";
                str5 = str4;
                break;
            case 9:
                str4 = "24";
                str5 = str4;
                break;
            case 10:
                str4 = "55";
                str5 = str4;
                break;
        }
        switch (AnonymousClass1.b[textSetting.getPrintRotation().ordinal()]) {
            case 1:
            default:
                str7 = "";
                break;
            case 2:
                str6 = "90";
                str7 = str6;
                break;
            case 3:
                str6 = "180";
                str7 = str6;
                break;
            case 4:
                str6 = "270";
                str7 = str6;
                break;
        }
        if (textSetting.getxMultiplication() > 16 || textSetting.getxMultiplication() < 0) {
            textSetting.setxMultiplication(1);
        }
        if (textSetting.getyMultiplication() > 16 || textSetting.getyMultiplication() < 0) {
            textSetting.setyMultiplication(1);
        }
        String str10 = textSetting.getxMultiplication() + "";
        String str11 = textSetting.getyMultiplication() + "";
        int cpclFontSize = textSetting.getCpclFontSize();
        if (cpclFontSize < 0) {
            cpclFontSize = 0;
        }
        if (cpclFontSize > 6) {
            cpclFontSize = 6;
        }
        a(str7, str5, String.valueOf(cpclFontSize), str8, str9, str, str2, str10, str11);
    }

    private void a(String str, String str2, String str3) {
        arrayAddToList(String.format("BT %s %s %s\r\n", str, str2, str3).getBytes(), this.i);
    }

    private void a(String str, String str2, String str3, String str4, String str5, String str6, String str7) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(((((((((((((((("BARCODE") + " ") + str) + " ") + str2) + " ") + str3) + " ") + str4) + " ") + str5) + " ") + str6) + " ") + str7) + "\r\n");
        arrayAddToList(stringBuffer.toString().getBytes(), this.i);
    }

    private void a(String str, String str2, String str3, String str4, String str5, String str6, String str7, String str8, String str9) throws UnsupportedEncodingException {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("SETMAG " + str8 + " " + str9 + "\r\n");
        String str10 = ExifInterface.GPS_DIRECTION_TRUE + str;
        StringBuffer stringBuffer2 = new StringBuffer();
        stringBuffer2.append(str10);
        stringBuffer2.append(" ");
        stringBuffer2.append(str2);
        stringBuffer2.append(" ");
        stringBuffer2.append(str3);
        stringBuffer2.append(" ");
        stringBuffer2.append(str4);
        stringBuffer2.append(" ");
        stringBuffer2.append(str5);
        stringBuffer2.append(" ");
        stringBuffer2.append(str6);
        stringBuffer2.append("\r\n");
        stringBuffer.append(stringBuffer2);
        stringBuffer.append("SETMAG 1 1 \r\n");
        arrayAddToList(stringBuffer.toString().getBytes(str7), this.f);
    }

    private void a(String str, String str2, String str3, String str4, byte[] bArr) throws SdkException {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append((((((((((("EG") + " ") + str) + " ") + str2) + " ") + str3) + " ") + str4) + " ") + "\r\n");
        arrayAddToList(stringBuffer.toString().getBytes(), this.h);
        arrayAddToList(BitmapConvertUtil.bytesToHexStr(bArr).getBytes(), this.h);
        arrayAddToList("\r\n".getBytes(), this.h);
    }

    public byte[] CPCL_BOX(int i, int i2, int i3, int i4, int i5) {
        return String.format("BOX %s %s %s %s %s\r\n", Integer.valueOf(i), Integer.valueOf(i2), Integer.valueOf(i3), Integer.valueOf(i4), Integer.valueOf(i5)).getBytes();
    }

    public byte[] CPCL_LINE(int i, int i2, int i3, int i4, int i5) {
        return String.format("L %s %s %s %s %s\r\n", Integer.valueOf(i), Integer.valueOf(i2), Integer.valueOf(i3), Integer.valueOf(i4), Integer.valueOf(i5)).getBytes();
    }

    public void CPCL_QRCODE(String str, String str2, String str3, String str4, String str5, String str6) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(((((((((((((((("" + str) + " ") + "QR") + " ") + str2) + " ") + str3) + " ") + "M " + str4) + " ") + "U " + str5) + "\r\n") + "MA," + str6) + "\r\n") + "ENDQR") + "\r\n");
        arrayAddToList(stringBuffer.toString().getBytes(), this.i);
    }

    public void Cpcl_VBARCODE(String str, String str2, String str3, String str4, String str5, String str6, String str7) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(((((((((((((((("VBARCODE") + " ") + str) + " ") + str2) + " ") + str3) + " ") + str4) + " ") + str5) + " ") + str6) + " ") + str7) + "\r\n");
        arrayAddToList(stringBuffer.toString().getBytes(), this.i);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getAllCutCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBarcodeCmd(BarcodeType barcodeType, BarcodeSetting barcodeSetting, String str) throws SdkException {
        String str2;
        String str3;
        this.i.clear();
        int i = barcodeSetting.getPosition().x;
        int i2 = barcodeSetting.getPosition().y;
        int heightInDot = barcodeSetting.getHeightInDot();
        int narrowInDot = barcodeSetting.getNarrowInDot();
        int wideInDot = barcodeSetting.getWideInDot();
        int i3 = narrowInDot / wideInDot;
        if (narrowInDot != wideInDot || wideInDot != narrowInDot * 2) {
            i3 = 2;
        }
        String verifiedStr = getVerifiedStr(str, barcodeType);
        switch (AnonymousClass1.a[barcodeType.ordinal()]) {
            case 1:
                str2 = "UPCA";
                break;
            case 2:
                str2 = "EAN13";
                break;
            case 3:
                str2 = "EAN8";
                break;
            case 4:
                str2 = "39";
                break;
            case 5:
                str2 = "CODABAR";
                break;
            case 6:
                i3 = narrowInDot / narrowInDot;
                str2 = "128";
                break;
            case 7:
                str2 = "I2OF5";
                break;
            case 8:
                str2 = "QRCODE";
                break;
            default:
                str2 = "";
                break;
        }
        switch (AnonymousClass1.b[barcodeSetting.getPrintRotation().ordinal()]) {
            case 1:
            default:
                str3 = "0";
                break;
            case 2:
                str3 = "90";
                break;
            case 3:
                str3 = "180";
                break;
            case 4:
                str3 = "270";
                break;
        }
        if (barcodeType == BarcodeType.QR_CODE) {
            switch (AnonymousClass1.c[barcodeSetting.getQrcodeEccLevel().ordinal()]) {
                case 1:
                case 2:
                case 3:
                case 4:
                default:
                    int qrcodeDotSize = barcodeSetting.getQrcodeDotSize();
                    if (qrcodeDotSize < 0 || qrcodeDotSize > 32) {
                        qrcodeDotSize = 6;
                    }
                    CPCL_QRCODE("B", String.valueOf(i), String.valueOf(i2), "1", String.valueOf(qrcodeDotSize), verifiedStr);
                    break;
            }
        } else {
            if (barcodeSetting.getBarcodeStringPosition() != BarcodeStringPosition.NONE) {
                a("7", "0", "0");
            }
            String strValueOf = String.valueOf(narrowInDot);
            if (str3.equals("0") || str3.equals("180")) {
                a(str2, strValueOf, String.valueOf(i3), String.valueOf(heightInDot), String.valueOf(i), String.valueOf(i2), verifiedStr);
            } else {
                Cpcl_VBARCODE(str2, strValueOf, String.valueOf(i3), String.valueOf(heightInDot), String.valueOf(i), String.valueOf(i2), verifiedStr);
            }
        }
        return listToArray(this.i);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBeepCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBitmapCmd(BitmapSetting bitmapSetting, Bitmap bitmap) throws SdkException {
        this.h.clear();
        Position printPostion = bitmapSetting.getPrintPostion();
        int i = printPostion.x;
        int i2 = printPostion.y;
        int bimtapLimitWidth = bitmapSetting.getBimtapLimitWidth();
        if (bimtapLimitWidth < bitmap.getWidth()) {
            bitmap = BitmapConvertUtil.resizeBitmap(bitmap, bimtapLimitWidth);
        }
        a(((bitmap.getWidth() + 7) / 8) + "", bitmap.getHeight() + "", i + "", i2 + "", new BitmapUtil().GetCpclBitmapPrintCmd(bitmap));
        return listToArray(this.h);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCRCmd() {
        return d;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCommonSettingCmd(CommonSetting commonSetting) {
        this.g.clear();
        a(commonSetting.getSpeedEnum());
        return listToArray(this.g);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCpclHeaderCmd(int i, int i2, int i3, int i4) {
        if (i3 < 1) {
            i3 = 1;
        }
        StringBuffer stringBuffer = new StringBuffer("!U1 BEGIN-PAGE\r\n");
        stringBuffer.append("! " + i4 + " " + Lateral_Resolution + " " + Vertical_Resolution + " " + (i2 * 8) + " " + i3 + "\r\n");
        stringBuffer.append("PW " + (i * 8) + "\r\n");
        return stringBuffer.toString().getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawBox(int i, int i2, int i3, int i4, int i5) {
        return CPCL_BOX(i, i2, i3, i4, i5);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawLine(int i, int i2, int i3, int i4, int i5) {
        return CPCL_LINE(i, i2, i3, i4, i5);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getEndCmd() {
        return " FORM\r\nPRINT\r\n!U1 END-PAGE\r\n".getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHalfCutCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHeaderCmd() {
        try {
            throw new SdkException("Cpcl command not support the Method getHeaderCmd(), Pleas use getCpclHeaderCmd(pageHigh, printCopies) instead of the Method getHeaderCmd().");
        } catch (SdkException e2) {
            e2.printStackTrace();
            return new byte[0];
        }
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getLFCRCmd() {
        return e;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getLFCmd() {
        return c;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getOpenMoneyBoxCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getPrintCopies(int i) throws SdkException {
        throw new SdkException("Cpcl command not support the Method getPrintCopies, Pleas use getCpclHeaderCmd(pageHigh, printCopies) instead of the Method getPrintCopies.");
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getReverse(int i, int i2, int i3, int i4) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getSelfTestCmd() {
        return a;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getTextCmd(TextSetting textSetting, String str) throws UnsupportedEncodingException {
        this.f.clear();
        a(textSetting, str, getChartsetName());
        return listToArray(this.f);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getTextCmd(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException {
        this.f.clear();
        a(textSetting, str, str2);
        return listToArray(this.f);
    }
}
