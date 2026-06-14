package com.rt.printerlibrary.cmd;

import android.graphics.Bitmap;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.rt.printerlibrary.enumerate.BarcodeType;
import com.rt.printerlibrary.enumerate.Print80StatusCmd;
import com.rt.printerlibrary.exception.SdkException;
import com.rt.printerlibrary.setting.BarcodeSetting;
import com.rt.printerlibrary.setting.BitmapSetting;
import com.rt.printerlibrary.setting.CommonSetting;
import com.rt.printerlibrary.setting.TextSetting;
import com.rt.printerlibrary.utils.PrintStatusCmd;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

/* JADX INFO: loaded from: classes11.dex */
public abstract class Cmd {
    private ArrayList<Byte> btCmds = new ArrayList<>();
    private String chartsetName = "GBK";
    private int printCopies = 1;

    /* JADX INFO: renamed from: com.rt.printerlibrary.cmd.Cmd$1, reason: invalid class name */
    /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] a;
        static final /* synthetic */ int[] b;
        static final /* synthetic */ int[] c;

        static {
            int[] iArr = new int[Print80StatusCmd.values().length];
            c = iArr;
            try {
                iArr[Print80StatusCmd.cmd_Connect_status.ordinal()] = 1;
            } catch (NoSuchFieldError e) {
            }
            try {
                c[Print80StatusCmd.cmd_Opencover.ordinal()] = 2;
            } catch (NoSuchFieldError e2) {
            }
            try {
                c[Print80StatusCmd.cmd_Exhausted_paper.ordinal()] = 3;
            } catch (NoSuchFieldError e3) {
            }
            try {
                c[Print80StatusCmd.cmd_other_error.ordinal()] = 4;
            } catch (NoSuchFieldError e4) {
            }
            try {
                c[Print80StatusCmd.cmd_outpaper.ordinal()] = 5;
            } catch (NoSuchFieldError e5) {
            }
            try {
                c[Print80StatusCmd.cmd_IsPrinting.ordinal()] = 6;
            } catch (NoSuchFieldError e6) {
            }
            int[] iArr2 = new int[PrintStatusCmd.values().length];
            b = iArr2;
            try {
                iArr2[PrintStatusCmd.cmd_Normal.ordinal()] = 1;
            } catch (NoSuchFieldError e7) {
            }
            int[] iArr3 = new int[BarcodeType.values().length];
            a = iArr3;
            try {
                iArr3[BarcodeType.EAN8.ordinal()] = 1;
            } catch (NoSuchFieldError e8) {
            }
            try {
                a[BarcodeType.EAN13.ordinal()] = 2;
            } catch (NoSuchFieldError e9) {
            }
            try {
                a[BarcodeType.UPC_E.ordinal()] = 3;
            } catch (NoSuchFieldError e10) {
            }
            try {
                a[BarcodeType.UPC_A.ordinal()] = 4;
            } catch (NoSuchFieldError e11) {
            }
        }
    }

    public void append(byte[] bArr) {
        for (byte b : bArr) {
            this.btCmds.add(Byte.valueOf(b));
        }
    }

    protected void arrayAddToList(byte[] bArr, ArrayList<Byte> arrayList) {
        for (byte b : bArr) {
            arrayList.add(Byte.valueOf(b));
        }
    }

    public void clear() {
        this.btCmds.clear();
    }

    public abstract byte[] getAllCutCmd();

    public byte[] getAppendCmds() {
        if (this.btCmds.size() <= 0) {
            return new byte[0];
        }
        byte[] bArr = new byte[this.btCmds.size()];
        for (int i = 0; i < this.btCmds.size(); i++) {
            bArr[i] = this.btCmds.get(i).byteValue();
        }
        return bArr;
    }

    public abstract byte[] getBarcodeCmd(BarcodeType barcodeType, BarcodeSetting barcodeSetting, String str) throws SdkException;

    public abstract byte[] getBeepCmd();

    public abstract byte[] getBitmapCmd(BitmapSetting bitmapSetting, Bitmap bitmap) throws SdkException;

    public abstract byte[] getCRCmd();

    public String getChartsetName() {
        return this.chartsetName;
    }

    public abstract byte[] getCommonSettingCmd(CommonSetting commonSetting);

    public abstract byte[] getCpclHeaderCmd(int i, int i2, int i3, int i4);

    public abstract byte[] getDrawBox(int i, int i2, int i3, int i4, int i5);

    public abstract byte[] getDrawLine(int i, int i2, int i3, int i4, int i5);

    public abstract byte[] getEndCmd();

    public abstract byte[] getHalfCutCmd();

    public abstract byte[] getHeaderCmd();

    public abstract byte[] getLFCRCmd();

    public abstract byte[] getLFCmd();

    public byte[] getOpenMoneyBoxCmd() {
        return getOpenMoneyBoxCmd((byte) 0, (byte) 32, (byte) 1);
    }

    public byte[] getOpenMoneyBoxCmd(byte b, byte b2, byte b3) {
        return new byte[]{0, 0, 0, PrinterCommands.ESC, 112, b, b2, b3};
    }

    public byte[] getPrint80StausCmd(Print80StatusCmd print80StatusCmd) {
        byte[] bArr = {0};
        switch (AnonymousClass1.c[print80StatusCmd.ordinal()]) {
            case 1:
            case 6:
                return new byte[]{PrinterCommands.ESC, 70, 1};
            case 2:
            case 5:
                return new byte[]{PrinterCommands.DLE, 4, 2};
            case 3:
                return new byte[]{PrinterCommands.DLE, 4, 4};
            case 4:
                return new byte[]{PrinterCommands.DLE, 4, 3};
            default:
                return bArr;
        }
    }

    public abstract byte[] getPrintCopies(int i) throws SdkException;

    public byte[] getPrintStausCmd(PrintStatusCmd printStatusCmd) {
        byte[] bArr = {0};
        switch (AnonymousClass1.b[printStatusCmd.ordinal()]) {
            case 1:
                return new byte[]{PrinterCommands.ESC, 33, 63};
            default:
                return bArr;
        }
    }

    public abstract byte[] getReverse(int i, int i2, int i3, int i4);

    public abstract byte[] getSelfTestCmd();

    public abstract byte[] getTextCmd(TextSetting textSetting, String str) throws UnsupportedEncodingException;

    public abstract byte[] getTextCmd(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException;

    protected String getVerifiedStr(String str, BarcodeType barcodeType) {
        int iCharAt;
        switch (AnonymousClass1.a[barcodeType.ordinal()]) {
            case 1:
                iCharAt = 0;
                for (int i = 0; i < str.length(); i++) {
                    iCharAt += (str.charAt(i) - '0') * (i % 2 == 0 ? 3 : 1);
                }
                break;
            case 2:
                iCharAt = 0;
                for (int i2 = 0; i2 < str.length(); i2++) {
                    iCharAt += (str.charAt(i2) - '0') * (i2 % 2 == 0 ? 1 : 3);
                }
                break;
            case 3:
            case 4:
                iCharAt = 0;
                for (int i3 = 0; i3 < str.length(); i3++) {
                    iCharAt += (str.charAt(i3) - '0') * (i3 % 2 == 1 ? 1 : 3);
                }
                break;
            default:
                iCharAt = 0;
                break;
        }
        switch (AnonymousClass1.a[barcodeType.ordinal()]) {
            case 1:
            case 2:
            case 3:
            case 4:
                int i4 = 10 - (iCharAt % 10);
                return str + String.valueOf(i4 != 10 ? i4 : 0);
            default:
                return str;
        }
    }

    protected byte[] listToArray(ArrayList<Byte> arrayList) {
        byte[] bArr = new byte[arrayList.size()];
        for (int i = 0; i < arrayList.size(); i++) {
            bArr[i] = arrayList.get(i).byteValue();
        }
        return bArr;
    }

    public void setChartsetName(String str) {
        this.chartsetName = str;
    }
}
