package com.rt.printerlibrary.cmd;

import android.graphics.Bitmap;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.rt.printerlibrary.bean.LableSizeBean;
import com.rt.printerlibrary.bean.Position;
import com.rt.printerlibrary.enumerate.BarcodeStringPosition;
import com.rt.printerlibrary.enumerate.BarcodeType;
import com.rt.printerlibrary.enumerate.PrintDirection;
import com.rt.printerlibrary.enumerate.PrintRotation;
import com.rt.printerlibrary.enumerate.QrcodeEccLevel;
import com.rt.printerlibrary.enumerate.ZplFontTypeEnum;
import com.rt.printerlibrary.setting.BitmapSetting;
import com.rt.printerlibrary.setting.CommonSetting;
import com.rt.printerlibrary.setting.TextSetting;
import com.rt.printerlibrary.utils.BitmapConvertUtil;
import com.rt.printerlibrary.utils.BitmapUtil;
import com.rt.printerlibrary.utils.CRCUtil;
import com.rt.printerlibrary.utils.FuncUtils;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

/* JADX INFO: loaded from: classes11.dex */
public class ZplCmd extends Cmd {
    private static final byte[] a = {18, 84};
    private static final byte[] b = "^XA".getBytes();
    private static final byte[] c = {10};
    private static final byte[] d = {PrinterCommands.CR};
    private static final byte[] e = {10, PrinterCommands.CR};
    private ArrayList<Byte> f = new ArrayList<>();
    private ArrayList<Byte> g = new ArrayList<>();
    private ArrayList<Byte> h = new ArrayList<>();
    private StringBuffer i = new StringBuffer();

    /* JADX INFO: renamed from: com.rt.printerlibrary.cmd.ZplCmd$1, reason: invalid class name */
    /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] a;
        static final /* synthetic */ int[] b;
        static final /* synthetic */ int[] c;
        static final /* synthetic */ int[] d;
        static final /* synthetic */ int[] e;

        static {
            int[] iArr = new int[PrintDirection.values().length];
            e = iArr;
            try {
                iArr[PrintDirection.NORMAL.ordinal()] = 1;
            } catch (NoSuchFieldError e2) {
            }
            try {
                e[PrintDirection.REVERSE.ordinal()] = 2;
            } catch (NoSuchFieldError e3) {
            }
            int[] iArr2 = new int[BarcodeType.values().length];
            d = iArr2;
            try {
                iArr2[BarcodeType.UPC_A.ordinal()] = 1;
            } catch (NoSuchFieldError e4) {
            }
            try {
                d[BarcodeType.UPC_E.ordinal()] = 2;
            } catch (NoSuchFieldError e5) {
            }
            try {
                d[BarcodeType.EAN13.ordinal()] = 3;
            } catch (NoSuchFieldError e6) {
            }
            try {
                d[BarcodeType.EAN8.ordinal()] = 4;
            } catch (NoSuchFieldError e7) {
            }
            try {
                d[BarcodeType.CODE39.ordinal()] = 5;
            } catch (NoSuchFieldError e8) {
            }
            try {
                d[BarcodeType.CODABAR.ordinal()] = 6;
            } catch (NoSuchFieldError e9) {
            }
            try {
                d[BarcodeType.CODE128.ordinal()] = 7;
            } catch (NoSuchFieldError e10) {
            }
            int[] iArr3 = new int[QrcodeEccLevel.values().length];
            c = iArr3;
            try {
                iArr3[QrcodeEccLevel.L.ordinal()] = 1;
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
            int[] iArr4 = new int[PrintRotation.values().length];
            b = iArr4;
            try {
                iArr4[PrintRotation.Rotate0.ordinal()] = 1;
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
            int[] iArr5 = new int[BarcodeStringPosition.values().length];
            a = iArr5;
            try {
                iArr5[BarcodeStringPosition.NONE.ordinal()] = 1;
            } catch (NoSuchFieldError e19) {
            }
        }
    }

    private String a(int i, int i2, int i3) {
        return "^GB" + i + "," + i2 + "," + i3 + ",B,0";
    }

    private String a(PrintDirection printDirection) {
        String str = "N";
        switch (AnonymousClass1.e[printDirection.ordinal()]) {
            case 2:
                str = "I";
                break;
        }
        String str2 = "^PO" + str + "\n\r";
        this.i.append(str2);
        arrayAddToList(str2.getBytes(), this.g);
        return str2;
    }

    private String a(String str, String str2) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append((" ^PW" + str + "\n\r") + "^LL" + str2 + "\n\r");
        String string = stringBuffer.toString();
        this.i.append(string);
        arrayAddToList(string.getBytes(), this.g);
        return string;
    }

    private String a(String str, String str2, Bitmap bitmap) {
        String strZlibCompress = BitmapConvertUtil.zlibCompress(new BitmapUtil().GetZplBitmapPrintCmd(bitmap));
        StringBuffer stringBuffer = new StringBuffer("");
        stringBuffer.append("^FO" + str + "," + str2 + "\n");
        int width = ((bitmap.getWidth() + 7) / 8) * bitmap.getHeight();
        stringBuffer.append("^GFA," + width + "," + width + "," + ((bitmap.getWidth() + 7) / 8) + ",:Z64:" + strZlibCompress + ":" + FuncUtils.ByteArrToHex(CRCUtil.getCRCByteValue(strZlibCompress.getBytes())).replace(" ", "") + "\n");
        this.i.append(stringBuffer);
        return stringBuffer.toString();
    }

    private String a(String str, String str2, String str3, String str4, String str5) {
        return "^FO" + str + "," + str2 + "\n^BQN,2," + str3 + "," + str5 + "\n^FDMM," + str4 + "^FS\n";
    }

    private String a(String str, String str2, String str3, String str4, String str5, String str6) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("^FO");
        stringBuffer.append(str);
        stringBuffer.append(",");
        stringBuffer.append(str2);
        stringBuffer.append("\n");
        stringBuffer.append("^BY2");
        stringBuffer.append("^BC");
        stringBuffer.append(str4);
        stringBuffer.append(",");
        stringBuffer.append(str5);
        stringBuffer.append(",");
        stringBuffer.append(str6);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append("\n");
        stringBuffer.append("^FD");
        stringBuffer.append(str3);
        stringBuffer.append("^FS");
        stringBuffer.append("\n");
        return stringBuffer.toString();
    }

    private String a(String str, String str2, String str3, String str4, String str5, String str6, String str7, String str8) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("^FO");
        stringBuffer.append(str);
        stringBuffer.append(",");
        stringBuffer.append(str2);
        stringBuffer.append("\n");
        stringBuffer.append("^BY2");
        stringBuffer.append("^BK");
        stringBuffer.append(str4);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append(",");
        stringBuffer.append(str7);
        stringBuffer.append(",");
        stringBuffer.append(str8);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append(",");
        stringBuffer.append(str5);
        stringBuffer.append(",");
        stringBuffer.append(str6);
        stringBuffer.append("\n");
        stringBuffer.append("^FD");
        stringBuffer.append(str3);
        stringBuffer.append("^FS");
        stringBuffer.append("\n");
        return stringBuffer.toString();
    }

    private byte[] a(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException {
        if (textSetting == null) {
            textSetting = new TextSetting();
        }
        String str3 = textSetting.getTxtPrintPosition().x + "";
        String str4 = textSetting.getTxtPrintPosition().y + "";
        String value = textSetting.getZplFontTypeEnum().getValue();
        String str5 = "N";
        switch (AnonymousClass1.b[textSetting.getPrintRotation().ordinal()]) {
            case 2:
                str5 = "R";
                break;
            case 3:
                str5 = "I";
                break;
            case 4:
                str5 = "B";
                break;
        }
        int zplHeightFactor = textSetting.getZplHeightFactor();
        int zplWidthFactor = textSetting.getZplWidthFactor();
        if (textSetting.getZplFontTypeEnum() == ZplFontTypeEnum.FONT_DOWNLOAD_FONT) {
            if (zplHeightFactor < 10) {
                zplHeightFactor = 10;
            }
            if (zplWidthFactor < 10) {
                zplWidthFactor = 10;
            }
        } else {
            if (zplHeightFactor < 1 || zplHeightFactor > 10) {
                zplHeightFactor = 1;
            }
            if (zplWidthFactor < 1 || zplHeightFactor > 10) {
                zplWidthFactor = 1;
            }
        }
        String str6 = "^FO" + str3 + "," + str4 + "\n\r^A" + value + str5 + "," + zplHeightFactor + "," + zplWidthFactor + "\n\r^FD" + str + "^FS\n\r";
        byte[] bytes = str6.getBytes(str2);
        this.i.append(str6);
        arrayAddToList(bytes, this.f);
        return bytes;
    }

    private byte[] a(String str) {
        String str2 = "^RTPQ" + str + "^PQ" + str + "\n\r\n\r";
        this.i.append(str2);
        return str2.getBytes();
    }

    private String b(String str, String str2, String str3, String str4, String str5, String str6) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("^FO");
        stringBuffer.append(str);
        stringBuffer.append(",");
        stringBuffer.append(str2);
        stringBuffer.append("\n");
        stringBuffer.append("^BY2");
        stringBuffer.append("^B3");
        stringBuffer.append(str4);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append(",");
        stringBuffer.append(str5);
        stringBuffer.append(",");
        stringBuffer.append(str6);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append("\n");
        stringBuffer.append("^FD");
        stringBuffer.append(str3);
        stringBuffer.append("^FS");
        stringBuffer.append("\n");
        return stringBuffer.toString();
    }

    private String c(String str, String str2, String str3, String str4, String str5, String str6) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("^FO");
        stringBuffer.append(str);
        stringBuffer.append(",");
        stringBuffer.append(str2);
        stringBuffer.append("\n");
        stringBuffer.append("^BY2");
        stringBuffer.append("^B8");
        stringBuffer.append(str4);
        stringBuffer.append(",");
        stringBuffer.append(str5);
        stringBuffer.append(",");
        stringBuffer.append(str6);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append("\n");
        stringBuffer.append("^FD");
        stringBuffer.append(str3);
        stringBuffer.append("^FS");
        stringBuffer.append("\n");
        return stringBuffer.toString();
    }

    private String d(String str, String str2, String str3, String str4, String str5, String str6) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("^FO");
        stringBuffer.append(str);
        stringBuffer.append(",");
        stringBuffer.append(str2);
        stringBuffer.append("\n");
        stringBuffer.append("^BY2");
        stringBuffer.append("^BE");
        stringBuffer.append(str4);
        stringBuffer.append(",");
        stringBuffer.append(str5);
        stringBuffer.append(",");
        stringBuffer.append(str6);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append("\n");
        stringBuffer.append("^FD");
        stringBuffer.append(str3);
        stringBuffer.append("^FS");
        stringBuffer.append("\n");
        return stringBuffer.toString();
    }

    private String e(String str, String str2, String str3, String str4, String str5, String str6) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("^FO");
        stringBuffer.append(str);
        stringBuffer.append(",");
        stringBuffer.append(str2);
        stringBuffer.append("\n");
        stringBuffer.append("^BY2");
        stringBuffer.append("^BU");
        stringBuffer.append(str4);
        stringBuffer.append(",");
        stringBuffer.append(str5);
        stringBuffer.append(",");
        stringBuffer.append(str6);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append("\n");
        stringBuffer.append("^FD");
        stringBuffer.append(str3);
        stringBuffer.append("^FS");
        stringBuffer.append("\n");
        return stringBuffer.toString();
    }

    private String f(String str, String str2, String str3, String str4, String str5, String str6) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("^FO");
        stringBuffer.append(str);
        stringBuffer.append(",");
        stringBuffer.append(str2);
        stringBuffer.append("\n");
        stringBuffer.append("^BY2");
        stringBuffer.append("^B9");
        stringBuffer.append(str4);
        stringBuffer.append(",");
        stringBuffer.append(str5);
        stringBuffer.append(",");
        stringBuffer.append(str6);
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append(",");
        stringBuffer.append("N");
        stringBuffer.append("\n");
        stringBuffer.append("^FD");
        stringBuffer.append(str3);
        stringBuffer.append("^FS");
        stringBuffer.append("\n");
        return stringBuffer.toString();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getAllCutCmd() {
        return new byte[0];
    }

    /* JADX WARN: Removed duplicated region for block: B:15:0x0054  */
    /* JADX WARN: Removed duplicated region for block: B:29:0x009e  */
    @Override // com.rt.printerlibrary.cmd.Cmd
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public byte[] getBarcodeCmd(com.rt.printerlibrary.enumerate.BarcodeType r12, com.rt.printerlibrary.setting.BarcodeSetting r13, java.lang.String r14) throws com.rt.printerlibrary.exception.SdkException {
        /*
            Method dump skipped, instruction units count: 404
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.rt.printerlibrary.cmd.ZplCmd.getBarcodeCmd(com.rt.printerlibrary.enumerate.BarcodeType, com.rt.printerlibrary.setting.BarcodeSetting, java.lang.String):byte[]");
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBeepCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBitmapCmd(BitmapSetting bitmapSetting, Bitmap bitmap) {
        Position printPostion = bitmapSetting.getPrintPostion();
        int i = printPostion.x;
        int i2 = printPostion.y;
        int bimtapLimitWidth = bitmapSetting.getBimtapLimitWidth();
        if (bitmap.getWidth() > bimtapLimitWidth) {
            bitmap = BitmapConvertUtil.resizeBitmap(bitmap, bimtapLimitWidth);
        }
        return a(String.valueOf(i), String.valueOf(i2), bitmap).getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCRCmd() {
        return d;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCommonSettingCmd(CommonSetting commonSetting) {
        this.g.clear();
        LableSizeBean lableSizeBean = commonSetting.getLableSizeBean();
        if (lableSizeBean != null) {
            a((lableSizeBean.getLabelWidthInMM() * 8) + "", (lableSizeBean.getLabelHeightInMM() * 8) + "");
        }
        PrintDirection printDirection = commonSetting.getPrintDirection();
        if (printDirection != null) {
            a(printDirection);
        }
        return listToArray(this.g);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCpclHeaderCmd(int i, int i2, int i3, int i4) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawBox(int i, int i2, int i3, int i4, int i5) {
        StringBuffer stringBuffer = new StringBuffer("");
        stringBuffer.append("^FO" + i + "," + i2 + "\n");
        stringBuffer.append(a(Math.abs(i - i3), Math.abs(i2 - i4), i5));
        return stringBuffer.toString().getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawLine(int i, int i2, int i3, int i4, int i5) {
        StringBuffer stringBuffer = new StringBuffer("");
        stringBuffer.append("^FO" + i + "," + i2 + "\n");
        int iAbs = Math.abs(i - i3);
        int iAbs2 = Math.abs(i2 - i4);
        if (i == i3) {
            iAbs = i5;
        }
        if (i2 == i4) {
            iAbs2 = i5;
        }
        stringBuffer.append(a(iAbs, iAbs2, i5));
        return stringBuffer.toString().getBytes();
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getEndCmd() {
        byte[] bytes = "^XZ\r\n".getBytes();
        this.i.append("^XZ\r\n");
        return bytes;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHalfCutCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHeaderCmd() {
        StringBuffer stringBuffer = this.i;
        stringBuffer.delete(0, stringBuffer.length());
        this.i.append("^XA\n");
        return b;
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
    public byte[] getPrintCopies(int i) {
        if (i < 1) {
            i = 1;
        }
        return a(i + "");
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
        return a(textSetting, str, getChartsetName());
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getTextCmd(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException {
        this.f.clear();
        return a(textSetting, str, str2);
    }

    public String getZplSumCmds() {
        return this.i.toString();
    }
}
