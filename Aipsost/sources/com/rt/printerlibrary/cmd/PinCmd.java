package com.rt.printerlibrary.cmd;

import android.graphics.Bitmap;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.rt.printerlibrary.enumerate.BarcodeType;
import com.rt.printerlibrary.enumerate.PinLineSpaceEnum;
import com.rt.printerlibrary.enumerate.PrintDirection;
import com.rt.printerlibrary.enumerate.SettingEnum;
import com.rt.printerlibrary.exception.SdkException;
import com.rt.printerlibrary.setting.BarcodeSetting;
import com.rt.printerlibrary.setting.BitmapSetting;
import com.rt.printerlibrary.setting.CommonSetting;
import com.rt.printerlibrary.setting.TextSetting;
import com.rt.printerlibrary.utils.BitmapUtil;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

/* JADX INFO: loaded from: classes11.dex */
public class PinCmd extends Cmd {
    private static final byte[] a = {PrinterCommands.US, 72};
    private static final byte[] b = {PrinterCommands.ESC, 64};
    private static final byte[] c = {10, PrinterCommands.CLR};
    private static final byte[] d = {10};
    private static final byte[] e = {PrinterCommands.CR};
    private static final byte[] f = {10, PrinterCommands.CR};
    private ArrayList<Byte> g = new ArrayList<>();
    private ArrayList<Byte> h = new ArrayList<>();
    private ArrayList<Byte> i = new ArrayList<>();

    /* JADX INFO: renamed from: com.rt.printerlibrary.cmd.PinCmd$1, reason: invalid class name */
    /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] a;

        static {
            int[] iArr = new int[PinLineSpaceEnum.values().length];
            a = iArr;
            try {
                iArr[PinLineSpaceEnum.ONE_SIXTH_INCH.ordinal()] = 1;
            } catch (NoSuchFieldError e) {
            }
            try {
                a[PinLineSpaceEnum.ONE_EIGHTH_INCH.ordinal()] = 2;
            } catch (NoSuchFieldError e2) {
            }
            try {
                a[PinLineSpaceEnum.N_60_INCH.ordinal()] = 3;
            } catch (NoSuchFieldError e3) {
            }
            try {
                a[PinLineSpaceEnum.N_180_INCH.ordinal()] = 4;
            } catch (NoSuchFieldError e4) {
            }
        }
    }

    private ArrayList a(CommonSetting commonSetting) {
        this.h.clear();
        d(commonSetting);
        if (commonSetting.getAlign() != -1) {
            this.h.add(Byte.valueOf(PrinterCommands.ESC));
            this.h.add((byte) 97);
            this.h.add(Byte.valueOf((byte) commonSetting.getAlign()));
        }
        b(commonSetting);
        c(commonSetting);
        return this.h;
    }

    private ArrayList a(TextSetting textSetting) {
        this.g.clear();
        b(textSetting);
        getLFCRCmd();
        c(textSetting);
        d(textSetting);
        e(textSetting);
        h(textSetting);
        i(textSetting);
        f(textSetting);
        g(textSetting);
        j(textSetting);
        return this.g;
    }

    private void a(BitmapSetting bitmapSetting, Bitmap bitmap) {
        this.i.clear();
        int bimtapLimitWidth = bitmapSetting.getBimtapLimitWidth();
        BitmapUtil bitmapUtil = new BitmapUtil();
        if (bimtapLimitWidth == 0) {
            bimtapLimitWidth = bitmap.getWidth();
        }
        if (bimtapLimitWidth > 1680) {
            bimtapLimitWidth = 1680;
        }
        if (bimtapLimitWidth == bitmap.getWidth()) {
            arrayAddToList(bitmapUtil.Get24PinBitmapPrintCmd(bitmap), this.i);
        } else {
            arrayAddToList(bitmapUtil.Get24PinTimesBitmapPrintCmd(bitmap, bimtapLimitWidth / bitmap.getWidth()), this.i);
        }
        arrayAddToList(f, this.i);
    }

    private void b(CommonSetting commonSetting) {
        ArrayList<Byte> arrayList;
        byte b2;
        ArrayList<Byte> arrayList2;
        byte b3;
        PinLineSpaceEnum pinLineSpaceEnum = commonSetting.getPinLineSpaceEnum();
        if (pinLineSpaceEnum == null) {
        }
        int i = commonSetting.getnLineSpace();
        switch (AnonymousClass1.a[pinLineSpaceEnum.ordinal()]) {
            case 1:
                this.h.add(Byte.valueOf(PrinterCommands.ESC));
                arrayList = this.h;
                b2 = 50;
                arrayList.add(Byte.valueOf(b2));
                break;
            case 2:
                this.h.add(Byte.valueOf(PrinterCommands.ESC));
                arrayList = this.h;
                b2 = 48;
                arrayList.add(Byte.valueOf(b2));
                break;
            case 3:
                this.h.add(Byte.valueOf(PrinterCommands.ESC));
                arrayList2 = this.h;
                b3 = 65;
                arrayList2.add(Byte.valueOf(b3));
                this.h.add(Byte.valueOf((byte) i));
                break;
            case 4:
                this.h.add(Byte.valueOf(PrinterCommands.ESC));
                arrayList2 = this.h;
                b3 = 51;
                arrayList2.add(Byte.valueOf(b3));
                this.h.add(Byte.valueOf((byte) i));
                break;
        }
    }

    private void b(TextSetting textSetting) {
        ArrayList<Byte> arrayList;
        byte b2;
        SettingEnum bold = textSetting.getBold();
        SettingEnum settingEnum = SettingEnum.Enable;
        Byte bValueOf = Byte.valueOf(PrinterCommands.ESC);
        if (bold == settingEnum) {
            this.g.add(bValueOf);
            this.g.add((byte) 69);
            ArrayList<Byte> arrayList2 = this.g;
            byte[] bArr = f;
            arrayList2.add(Byte.valueOf(bArr[0]));
            arrayList = this.g;
            b2 = bArr[1];
        } else {
            if (textSetting.getBold() != SettingEnum.Disable) {
                return;
            }
            this.g.add(bValueOf);
            this.g.add((byte) 70);
            ArrayList<Byte> arrayList3 = this.g;
            byte[] bArr2 = f;
            arrayList3.add(Byte.valueOf(bArr2[0]));
            arrayList = this.g;
            b2 = bArr2[1];
        }
        arrayList.add(Byte.valueOf(b2));
    }

    private void c(CommonSetting commonSetting) {
        int iValue = commonSetting.getPageLengthEnum().value();
        if (iValue != -1) {
            this.h.add(Byte.valueOf(PrinterCommands.DLE));
            this.h.add((byte) 69);
            this.h.add(Byte.valueOf((byte) iValue));
            this.h.add(Byte.valueOf(PrinterCommands.DLE));
            this.h.add((byte) 67);
        }
    }

    private void c(TextSetting textSetting) {
        ArrayList<Byte> arrayList;
        byte b2;
        SettingEnum italic = textSetting.getItalic();
        SettingEnum settingEnum = SettingEnum.Enable;
        Byte bValueOf = Byte.valueOf(PrinterCommands.ESC);
        if (italic == settingEnum) {
            this.g.add(bValueOf);
            arrayList = this.g;
            b2 = 52;
        } else {
            if (textSetting.getItalic() != SettingEnum.Disable) {
                return;
            }
            this.g.add(bValueOf);
            arrayList = this.g;
            b2 = 53;
        }
        arrayList.add(Byte.valueOf(b2));
    }

    private void d(CommonSetting commonSetting) {
        int absolutionPositionN = commonSetting.getAbsolutionPositionN();
        if (absolutionPositionN > 636) {
            absolutionPositionN = 636;
        } else if (absolutionPositionN < 0) {
            return;
        }
        this.h.add(Byte.valueOf(PrinterCommands.ESC));
        this.h.add((byte) 36);
        this.h.add(Byte.valueOf((byte) (absolutionPositionN % 256)));
        this.h.add(Byte.valueOf((byte) (absolutionPositionN / 256)));
    }

    private void d(TextSetting textSetting) {
        ArrayList<Byte> arrayList;
        byte b2;
        SettingEnum underline = textSetting.getUnderline();
        SettingEnum settingEnum = SettingEnum.Enable;
        Byte bValueOf = Byte.valueOf(PrinterCommands.ESC);
        if (underline == settingEnum) {
            this.g.add(bValueOf);
            this.g.add((byte) 45);
            arrayList = this.g;
            b2 = 1;
        } else {
            if (textSetting.getUnderline() != SettingEnum.Disable) {
                return;
            }
            this.g.add(bValueOf);
            this.g.add((byte) 45);
            arrayList = this.g;
            b2 = 0;
        }
        arrayList.add(Byte.valueOf(b2));
    }

    private void e(TextSetting textSetting) {
        if (textSetting.getAlign() != -1) {
            this.g.add(Byte.valueOf(PrinterCommands.ESC));
            this.g.add((byte) 97);
            this.g.add(Byte.valueOf((byte) textSetting.getAlign()));
        }
    }

    private void f(TextSetting textSetting) {
        if (textSetting.getFontStyle() != -1) {
            this.g.add(Byte.valueOf(PrinterCommands.ESC));
            this.g.add((byte) 113);
            this.g.add(Byte.valueOf((byte) textSetting.getFontStyle()));
        }
    }

    private void g(TextSetting textSetting) {
        if (textSetting.getPinPrintMode() != -1) {
            this.g.add(Byte.valueOf(PrinterCommands.ESC));
            this.g.add((byte) 85);
            this.g.add(Byte.valueOf((byte) textSetting.getPinPrintMode()));
        }
    }

    private void h(TextSetting textSetting) {
        ArrayList<Byte> arrayList;
        byte b2;
        SettingEnum doubleWidth = textSetting.getDoubleWidth();
        SettingEnum settingEnum = SettingEnum.Enable;
        Byte bValueOf = Byte.valueOf(PrinterCommands.ESC);
        if (doubleWidth == settingEnum) {
            this.g.add(bValueOf);
            this.g.add((byte) 87);
            arrayList = this.g;
            b2 = 1;
        } else {
            if (textSetting.getDoubleWidth() != SettingEnum.Disable) {
                return;
            }
            this.g.add(bValueOf);
            this.g.add((byte) 87);
            arrayList = this.g;
            b2 = 0;
        }
        arrayList.add(Byte.valueOf(b2));
    }

    private void i(TextSetting textSetting) {
        ArrayList<Byte> arrayList;
        byte b2;
        SettingEnum doubleHeight = textSetting.getDoubleHeight();
        SettingEnum settingEnum = SettingEnum.Enable;
        Byte bValueOf = Byte.valueOf(PrinterCommands.ESC);
        if (doubleHeight == settingEnum) {
            this.g.add(bValueOf);
            this.g.add((byte) 119);
            arrayList = this.g;
            b2 = 1;
        } else {
            if (textSetting.getDoubleHeight() != SettingEnum.Disable) {
                return;
            }
            this.g.add(bValueOf);
            this.g.add((byte) 119);
            arrayList = this.g;
            b2 = 0;
        }
        arrayList.add(Byte.valueOf(b2));
    }

    private void j(TextSetting textSetting) {
        ArrayList<Byte> arrayList;
        byte b2;
        SettingEnum doublePrinting = textSetting.getDoublePrinting();
        SettingEnum settingEnum = SettingEnum.Enable;
        Byte bValueOf = Byte.valueOf(PrinterCommands.ESC);
        if (doublePrinting == settingEnum) {
            this.g.add(bValueOf);
            arrayList = this.g;
            b2 = 71;
        } else {
            if (textSetting.getDoublePrinting() != SettingEnum.Disable) {
                return;
            }
            this.g.add(bValueOf);
            arrayList = this.g;
            b2 = 72;
        }
        arrayList.add(Byte.valueOf(b2));
    }

    public byte[] getAbsolutePrintPositiionCmd(int i) {
        if (i > 636) {
            i = 636;
        } else if (i < 0) {
            return new byte[]{0};
        }
        return new byte[]{PrinterCommands.ESC, 36, (byte) (i % 256), (byte) (i / 256)};
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getAllCutCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBarcodeCmd(BarcodeType barcodeType, BarcodeSetting barcodeSetting, String str) throws SdkException {
        throw new SdkException("Pin Cmd Not Support barcode printing");
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBeepCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBitmapCmd(BitmapSetting bitmapSetting, Bitmap bitmap) {
        a(bitmapSetting, bitmap);
        return listToArray(this.i);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCRCmd() {
        return e;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCommonSettingCmd(CommonSetting commonSetting) {
        a(commonSetting);
        return listToArray(this.h);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCpclHeaderCmd(int i, int i2, int i3, int i4) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawBox(int i, int i2, int i3, int i4, int i5) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawLine(int i, int i2, int i3, int i4, int i5) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getEndCmd() {
        return c;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHalfCutCmd() {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHeaderCmd() {
        System.out.println("com.rt.printerlibrary.cmd.PinCmd.getHeaderCmd");
        return b;
    }

    public byte[] getJumpingRow180thCmd(PrintDirection printDirection, byte b2) {
        byte[] bArr = {PrinterCommands.ESC, 74, b2};
        if (printDirection == PrintDirection.REVERSE) {
            bArr[1] = 106;
        }
        return bArr;
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
        return new byte[0];
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
        a(textSetting);
        byte[] bytes = str.getBytes(getChartsetName());
        for (byte b2 : bytes) {
            this.g.add(Byte.valueOf(b2));
        }
        return listToArray(this.g);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getTextCmd(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException {
        System.out.println("com.rt.printerlibrary.cmd.PinCmd.getTextCmd");
        a(textSetting);
        byte[] bytes = str.getBytes(str2);
        for (byte b2 : bytes) {
            this.g.add(Byte.valueOf(b2));
        }
        return listToArray(this.g);
    }
}
