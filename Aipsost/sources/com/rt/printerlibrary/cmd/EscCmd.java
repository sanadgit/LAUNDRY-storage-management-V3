package com.rt.printerlibrary.cmd;

import android.graphics.Bitmap;
import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import com.rt.printerlibrary.enumerate.BarcodeStringPosition;
import com.rt.printerlibrary.enumerate.BarcodeType;
import com.rt.printerlibrary.enumerate.BmpPrintMode;
import com.rt.printerlibrary.enumerate.ESCBarcodeFontTypeEnum;
import com.rt.printerlibrary.enumerate.ESCFontTypeEnum;
import com.rt.printerlibrary.enumerate.EscBarcodePrintOritention;
import com.rt.printerlibrary.enumerate.PrinterAskStatusEnum;
import com.rt.printerlibrary.exception.SdkException;
import com.rt.printerlibrary.setting.BarcodeSetting;
import com.rt.printerlibrary.setting.BitmapSetting;
import com.rt.printerlibrary.setting.CommonSetting;
import com.rt.printerlibrary.setting.TextSetting;
import com.rt.printerlibrary.utils.BitmapConvertUtil;
import com.rt.printerlibrary.utils.BitmapUtil;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import kotlin.jvm.internal.ByteCompanionObject;

/* JADX INFO: loaded from: classes11.dex */
public class EscCmd extends Cmd {
    private static final String a = EscCmd.class.getSimpleName();
    private static final byte[] b = {18, 84};
    private static final byte[] c = {PrinterCommands.ESC, 64};
    private static final byte[] d = {10};
    private static final byte[] e = {PrinterCommands.CR};
    private static final byte[] f = {10, PrinterCommands.CR};
    private static final byte[] g = {3, -1, 96, 0, 0, 0, 0, 0, PrinterCommands.DLE, 0, -116, 94, 0, 0, 37, ByteCompanionObject.MIN_VALUE, -6, 0, 0, 1, 0, 0, 0, 0, -56, 0, -56, 0};
    private static final byte[] h = {3, -1, 96, 0, 0, 0, 0, 0, PrinterCommands.DLE, 0, -116, 95, 0, 0, 37, ByteCompanionObject.MIN_VALUE, -6, 0, 1, 1, 0, 0, 0, 0, -56, 0, -56, 0};
    private static final byte[] i = {3, -1, 96, 0, 0, 0, 0, 0, PrinterCommands.DLE, 0, -116, 92, 0, 0, 37, ByteCompanionObject.MIN_VALUE, -6, 0, 2, 1, 0, 0, 0, 0, -56, 0, -56, 0};
    private static final byte[] j = {3, -1, 96, 0, 0, 0, 0, 0, PrinterCommands.DLE, 0, -116, 93, 0, 0, 37, ByteCompanionObject.MIN_VALUE, -6, 0, 3, 1, 0, 0, 0, 0, -56, 0, -56, 0};
    private ArrayList<Byte> k = new ArrayList<>();
    private ArrayList<Byte> l = new ArrayList<>();
    private ArrayList<Byte> m = new ArrayList<>();
    private ArrayList<Byte> n = new ArrayList<>();

    /* JADX INFO: renamed from: com.rt.printerlibrary.cmd.EscCmd$1, reason: invalid class name */
    /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] a;
        static final /* synthetic */ int[] b;
        static final /* synthetic */ int[] c;
        static final /* synthetic */ int[] d;
        static final /* synthetic */ int[] e;

        static {
            int[] iArr = new int[EscBarcodePrintOritention.values().length];
            e = iArr;
            try {
                iArr[EscBarcodePrintOritention.Rotate0.ordinal()] = 1;
            } catch (NoSuchFieldError e2) {
            }
            try {
                e[EscBarcodePrintOritention.Rotate90.ordinal()] = 2;
            } catch (NoSuchFieldError e3) {
            }
            try {
                e[EscBarcodePrintOritention.Rotate270.ordinal()] = 3;
            } catch (NoSuchFieldError e4) {
            }
            int[] iArr2 = new int[ESCBarcodeFontTypeEnum.values().length];
            d = iArr2;
            try {
                iArr2[ESCBarcodeFontTypeEnum.BARFONT_A_12x24.ordinal()] = 1;
            } catch (NoSuchFieldError e5) {
            }
            try {
                d[ESCBarcodeFontTypeEnum.BARFONT_B_9x17.ordinal()] = 2;
            } catch (NoSuchFieldError e6) {
            }
            int[] iArr3 = new int[BarcodeStringPosition.values().length];
            c = iArr3;
            try {
                iArr3[BarcodeStringPosition.NONE.ordinal()] = 1;
            } catch (NoSuchFieldError e7) {
            }
            try {
                c[BarcodeStringPosition.ABOVE_BARCODE.ordinal()] = 2;
            } catch (NoSuchFieldError e8) {
            }
            try {
                c[BarcodeStringPosition.BELOW_BARCODE.ordinal()] = 3;
            } catch (NoSuchFieldError e9) {
            }
            try {
                c[BarcodeStringPosition.ABOVE_BELOW_BARCODE.ordinal()] = 4;
            } catch (NoSuchFieldError e10) {
            }
            int[] iArr4 = new int[ESCFontTypeEnum.values().length];
            b = iArr4;
            try {
                iArr4[ESCFontTypeEnum.FONT_A_12x24.ordinal()] = 1;
            } catch (NoSuchFieldError e11) {
            }
            try {
                b[ESCFontTypeEnum.FONT_B_9x24.ordinal()] = 2;
            } catch (NoSuchFieldError e12) {
            }
            try {
                b[ESCFontTypeEnum.FONT_C_9x17.ordinal()] = 3;
            } catch (NoSuchFieldError e13) {
            }
            try {
                b[ESCFontTypeEnum.FONT_D_8x16.ordinal()] = 4;
            } catch (NoSuchFieldError e14) {
            }
            int[] iArr5 = new int[BarcodeType.values().length];
            a = iArr5;
            try {
                iArr5[BarcodeType.UPC_A.ordinal()] = 1;
            } catch (NoSuchFieldError e15) {
            }
            try {
                a[BarcodeType.UPC_E.ordinal()] = 2;
            } catch (NoSuchFieldError e16) {
            }
            try {
                a[BarcodeType.EAN13.ordinal()] = 3;
            } catch (NoSuchFieldError e17) {
            }
            try {
                a[BarcodeType.EAN8.ordinal()] = 4;
            } catch (NoSuchFieldError e18) {
            }
            try {
                a[BarcodeType.CODE39.ordinal()] = 5;
            } catch (NoSuchFieldError e19) {
            }
            try {
                a[BarcodeType.ITF.ordinal()] = 6;
            } catch (NoSuchFieldError e20) {
            }
            try {
                a[BarcodeType.CODABAR.ordinal()] = 7;
            } catch (NoSuchFieldError e21) {
            }
            try {
                a[BarcodeType.CODE93.ordinal()] = 8;
            } catch (NoSuchFieldError e22) {
            }
            try {
                a[BarcodeType.CODE128.ordinal()] = 9;
            } catch (NoSuchFieldError e23) {
            }
            try {
                a[BarcodeType.QR_CODE.ordinal()] = 10;
            } catch (NoSuchFieldError e24) {
            }
        }
    }

    private ArrayList a(TextSetting textSetting) {
        this.k.clear();
        b(textSetting);
        return this.k;
    }

    private void a() {
        this.k.add(Byte.valueOf(PrinterCommands.FS));
        this.k.add((byte) 38);
    }

    private void a(int i2) {
        arrayAddToList(new byte[]{PrinterCommands.ESC, 57, (byte) i2}, this.k);
    }

    private void a(Bitmap bitmap, int i2) {
        Bitmap bitmapCreateScaledBitmap = bitmap.getWidth() > i2 ? Bitmap.createScaledBitmap(bitmap, i2, (int) ((i2 / bitmap.getWidth()) * bitmap.getHeight()), false) : bitmap;
        byte width = (byte) (((bitmapCreateScaledBitmap.getWidth() + 7) / 8) % 256);
        byte width2 = (byte) (((bitmapCreateScaledBitmap.getWidth() + 7) / 8) / 256);
        int i3 = bitmapCreateScaledBitmap.getHeight() % 30 == 0 ? 31 : 30;
        int height = ((bitmapCreateScaledBitmap.getHeight() + i3) - 1) / i3;
        int width3 = (bitmapCreateScaledBitmap.getWidth() + 7) / 8;
        byte[] bArrConvert = BitmapConvertUtil.convert(bitmapCreateScaledBitmap);
        for (int i4 = 0; i4 < height; i4++) {
            if (i4 != height - 1) {
                arrayAddToList(new byte[]{PrinterCommands.GS, 118, 48, 0, width, width2, (byte) i3, 0}, this.m);
                arrayAddToList(Arrays.copyOfRange(bArrConvert, width3 * i4 * i3, ((width3 * i3) * (i4 + 1)) - 1), this.m);
                arrayAddToList(new byte[]{10}, this.m);
            } else {
                arrayAddToList(new byte[]{PrinterCommands.GS, 118, 48, 0, width, width2, (byte) (bitmapCreateScaledBitmap.getHeight() % i3), 0}, this.m);
                arrayAddToList(Arrays.copyOfRange(bArrConvert, width3 * i4 * i3, bArrConvert.length), this.m);
                arrayAddToList(new byte[]{10}, this.m);
            }
        }
        arrayAddToList(getLFCRCmd(), this.m);
    }

    private void a(BarcodeStringPosition barcodeStringPosition) {
        ArrayList<Byte> arrayList;
        if (barcodeStringPosition == null) {
            return;
        }
        this.n.add(Byte.valueOf(PrinterCommands.GS));
        this.n.add((byte) 72);
        byte b2 = 0;
        switch (AnonymousClass1.c[barcodeStringPosition.ordinal()]) {
            case 1:
            default:
                arrayList = this.n;
                break;
            case 2:
                arrayList = this.n;
                b2 = 1;
                break;
            case 3:
                arrayList = this.n;
                b2 = 2;
                break;
            case 4:
                arrayList = this.n;
                b2 = 3;
                break;
        }
        arrayList.add(Byte.valueOf(b2));
    }

    private void a(ESCBarcodeFontTypeEnum eSCBarcodeFontTypeEnum) {
        Byte b2 = (byte) 0;
        this.n.add(Byte.valueOf(PrinterCommands.GS));
        this.n.add((byte) 102);
        switch (AnonymousClass1.d[eSCBarcodeFontTypeEnum.ordinal()]) {
            case 2:
                b2 = (byte) 1;
                break;
        }
        this.n.add(Byte.valueOf(b2.byteValue()));
    }

    private void a(BarcodeSetting barcodeSetting) {
        int barcodeWidth = barcodeSetting.getBarcodeWidth();
        int heightInDot = barcodeSetting.getHeightInDot();
        if (barcodeWidth < 2 || barcodeWidth > 6) {
            barcodeWidth = 3;
        }
        this.n.add(Byte.valueOf(PrinterCommands.GS));
        this.n.add((byte) 119);
        this.n.add(Byte.valueOf((byte) barcodeWidth));
        if (heightInDot < 1 || heightInDot > 255) {
            heightInDot = 72;
        }
        this.n.add(Byte.valueOf(PrinterCommands.GS));
        this.n.add((byte) 104);
        this.n.add(Byte.valueOf((byte) heightInDot));
    }

    private void a(CommonSetting commonSetting) {
        int pageWidth = commonSetting.getPageWidth();
        if (pageWidth > 636) {
            pageWidth = 636;
        } else if (pageWidth < 0) {
            pageWidth = 10;
        }
        this.l.add(Byte.valueOf(PrinterCommands.GS));
        this.l.add((byte) 87);
        this.l.add(Byte.valueOf((byte) (pageWidth % 256)));
        this.l.add(Byte.valueOf((byte) (pageWidth / 256)));
    }

    private void a(String str) {
        byte[] bArr = new byte[str.length() + 4];
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        bArr[2] = (byte) 8;
        int i2 = 3;
        int i3 = 0;
        while (i3 < str.length()) {
            bArr[i2] = (byte) str.charAt(i3);
            i3++;
            i2++;
        }
        bArr[i2] = 0;
        arrayAddToList(bArr, this.n);
    }

    private void a(String str, int i2) {
        arrayAddToList(new byte[]{PrinterCommands.GS, 40, 107, 3, 0, 49, 67, (byte) i2}, this.n);
        arrayAddToList(new byte[]{PrinterCommands.GS, 40, 107, 3, 0, 49, 69, 48}, this.n);
        byte[] bytes = str.getBytes();
        byte length = (byte) ((bytes.length + 3) % 256);
        byte length2 = (byte) ((bytes.length + 3) / 256);
        ByteBuffer byteBufferAllocateDirect = ByteBuffer.allocateDirect(bytes.length + 8);
        byteBufferAllocateDirect.put(new byte[]{PrinterCommands.GS, 40, 107, length, length2, 49, 80, 48}, 0, 8);
        byteBufferAllocateDirect.put(bytes, 0, bytes.length);
        arrayAddToList(byteBufferAllocateDirect.array(), this.n);
        arrayAddToList(new byte[]{PrinterCommands.ESC, 97, 0}, this.n);
        arrayAddToList(new byte[]{PrinterCommands.ESC, 97, 1}, this.n);
        arrayAddToList(new byte[]{PrinterCommands.GS, 40, 107, 3, 0, 49, 81, 48}, this.n);
    }

    private byte[] a(byte b2, byte b3) {
        if (b2 < 1 && b2 > 9) {
            b2 = 1;
        }
        if (b3 < 1 && b3 > 9) {
            b3 = 3;
        }
        return new byte[]{PrinterCommands.ESC, 66, b2, b3};
    }

    /* JADX WARN: Removed duplicated region for block: B:23:0x0053  */
    /* JADX WARN: Removed duplicated region for block: B:24:0x0058  */
    /* JADX WARN: Removed duplicated region for block: B:30:0x006f  */
    /* JADX WARN: Removed duplicated region for block: B:32:0x0073  */
    /* JADX WARN: Removed duplicated region for block: B:37:0x0087  */
    /* JADX WARN: Removed duplicated region for block: B:38:0x008c  */
    /* JADX WARN: Removed duplicated region for block: B:44:0x00a4  */
    /* JADX WARN: Removed duplicated region for block: B:46:0x00ab  */
    /* JADX WARN: Removed duplicated region for block: B:51:0x00c5  */
    /* JADX WARN: Removed duplicated region for block: B:52:0x00ca  */
    /* JADX WARN: Removed duplicated region for block: B:58:0x00e1  */
    /* JADX WARN: Removed duplicated region for block: B:66:0x018e  */
    /* JADX WARN: Removed duplicated region for block: B:75:0x01cd  */
    /* JADX WARN: Removed duplicated region for block: B:87:? A[ADDED_TO_REGION, RETURN, SYNTHETIC] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private void b(com.rt.printerlibrary.setting.TextSetting r11) {
        /*
            Method dump skipped, instruction units count: 528
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.rt.printerlibrary.cmd.EscCmd.b(com.rt.printerlibrary.setting.TextSetting):void");
    }

    public void CODE39(String str) {
        int length = str.length();
        byte[] bArr = new byte[length + 4];
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        bArr[2] = (byte) 4;
        for (int i2 = 0; i2 < length; i2++) {
            if (str.charAt(i2) > 127 || str.charAt(i2) < ' ') {
                return;
            }
        }
        if (length > 30) {
            return;
        }
        int i3 = 3;
        int i4 = 0;
        while (i4 < length) {
            bArr[i3] = (byte) str.charAt(i4);
            i4++;
            i3++;
        }
        bArr[i3] = 0;
        arrayAddToList(bArr, this.n);
    }

    public void CODE93(String str) {
        int length = str.length();
        byte[] bArr = new byte[length + 3];
        int i2 = 0;
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        bArr[2] = (byte) 7;
        for (int i3 = 0; i3 < length; i3++) {
            if (str.charAt(i3) > 127 || str.charAt(i3) < ' ') {
                return;
            }
        }
        if (length > 30) {
            return;
        }
        int i4 = 3;
        while (i2 < length) {
            bArr[i4] = (byte) str.charAt(i2);
            i2++;
            i4++;
        }
        arrayAddToList(bArr, this.n);
    }

    public void CODEBAR(String str) {
        int length = str.length();
        byte[] bArr = new byte[length + 4];
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        bArr[2] = (byte) 6;
        for (int i2 = 0; i2 < length; i2++) {
            if (str.charAt(i2) > 127 || str.charAt(i2) < ' ') {
                return;
            }
        }
        if (length > 30) {
            return;
        }
        int i3 = 3;
        int i4 = 0;
        while (i4 < length) {
            bArr[i3] = (byte) str.charAt(i4);
            i4++;
            i3++;
        }
        bArr[i3] = 0;
        arrayAddToList(bArr, this.n);
    }

    public void Code128_B(String str) {
        int length = str.length();
        byte[] bArr = new byte[1024];
        int i2 = 0;
        bArr[0] = PrinterCommands.GS;
        int i3 = 1;
        bArr[1] = 107;
        bArr[2] = (byte) 73;
        bArr[4] = 123;
        bArr[5] = 66;
        for (int i4 = 0; i4 < length; i4++) {
            if (str.charAt(i4) > 127 || str.charAt(i4) < ' ') {
                return;
            }
        }
        if (length > 42) {
            return;
        }
        int i5 = 6;
        int i6 = 0;
        for (int i7 = 0; i7 < length; i7++) {
            int i8 = i5 + 1;
            bArr[i5] = (byte) str.charAt(i7);
            if (str.charAt(i7) == '{') {
                i5 = i8 + 1;
                bArr[i8] = (byte) str.charAt(i7);
                i6++;
            } else {
                i5 = i8;
            }
        }
        int iCharAt = 104;
        while (i2 < length) {
            iCharAt += i3 * (str.charAt(i2) - ' ');
            i2++;
            i3++;
        }
        int i9 = iCharAt % 103;
        if (i9 >= 0 && i9 <= 95) {
            bArr[i5] = (byte) (i9 + 32);
            bArr[3] = (byte) (length + 3 + i6);
        } else if (i9 == 96) {
            bArr[i5] = 123;
            bArr[i5 + 1] = 51;
            bArr[3] = (byte) (length + 4 + i6);
        } else if (i9 == 97) {
            bArr[i5] = 123;
            bArr[i5 + 1] = 50;
            bArr[3] = (byte) (length + 4 + i6);
        } else if (i9 == 98) {
            bArr[i5] = 123;
            bArr[i5 + 1] = 83;
            bArr[3] = (byte) (length + 4 + i6);
        } else if (i9 == 99) {
            bArr[i5] = 123;
            bArr[i5 + 1] = 67;
            bArr[3] = (byte) (length + 4 + i6);
        } else if (i9 == 100) {
            bArr[i5] = 123;
            bArr[i5 + 1] = 52;
            bArr[3] = (byte) (length + 4 + i6);
        } else if (i9 == 101) {
            bArr[i5] = 123;
            bArr[i5 + 1] = 65;
            bArr[3] = (byte) (length + 4 + i6);
        } else if (i9 == 102) {
            bArr[i5] = 123;
            bArr[i5 + 1] = 49;
            bArr[3] = (byte) (length + 4 + i6);
        }
        arrayAddToList(bArr, this.n);
    }

    public void EAN13(String str) {
        int length = str.length();
        byte[] bArr = new byte[length + 4];
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        bArr[2] = (byte) 2;
        for (int i2 = 0; i2 < length; i2++) {
            if (str.charAt(i2) > '9' || str.charAt(i2) < '0') {
                return;
            }
        }
        if (length > 30) {
            return;
        }
        int i3 = 3;
        int i4 = 0;
        while (i4 < length) {
            bArr[i3] = (byte) str.charAt(i4);
            i4++;
            i3++;
        }
        bArr[i3] = 0;
        arrayAddToList(bArr, this.n);
    }

    public void EAN8(String str) {
        int length = str.length();
        byte[] bArr = new byte[length + 4];
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        int i2 = 3;
        bArr[2] = (byte) 3;
        for (int i3 = 0; i3 < length; i3++) {
            if (str.charAt(i3) > '9' || str.charAt(i3) < '0') {
                return;
            }
        }
        if (length > 30) {
            return;
        }
        int i4 = 0;
        while (i4 < length) {
            bArr[i2] = (byte) str.charAt(i4);
            i4++;
            i2++;
        }
        bArr[i2] = 0;
        arrayAddToList(bArr, this.n);
    }

    public void ITF(String str) {
        int length = str.length();
        byte[] bArr = new byte[length + 4];
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        bArr[2] = (byte) 5;
        for (int i2 = 0; i2 < length; i2++) {
            if (str.charAt(i2) > '9' || str.charAt(i2) < '0') {
                return;
            }
        }
        if (length > 30) {
            return;
        }
        int i3 = 3;
        int i4 = 0;
        while (i4 < length) {
            bArr[i3] = (byte) str.charAt(i4);
            i4++;
            i3++;
        }
        bArr[i3] = 0;
        arrayAddToList(bArr, this.n);
    }

    public void UPCA(String str) {
        int length = str.length();
        byte[] bArr = new byte[length + 4];
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        bArr[2] = (byte) 0;
        for (int i2 = 0; i2 < length; i2++) {
            if (str.charAt(i2) > '9' || str.charAt(i2) < '0') {
                return;
            }
        }
        if (length > 30) {
            return;
        }
        int i3 = 3;
        int i4 = 0;
        while (i4 < length) {
            bArr[i3] = (byte) str.charAt(i4);
            i4++;
            i3++;
        }
        bArr[i3] = 0;
        arrayAddToList(bArr, this.n);
    }

    public void UPCE(String str) {
        int length = str.length();
        byte[] bArr = new byte[length + 4];
        bArr[0] = PrinterCommands.GS;
        bArr[1] = 107;
        bArr[2] = (byte) 1;
        for (int i2 = 0; i2 < length; i2++) {
            if (str.charAt(i2) > '9' || str.charAt(i2) < '0') {
                return;
            }
        }
        if (length > 30) {
            return;
        }
        int i3 = 3;
        int i4 = 0;
        while (i4 < length) {
            bArr[i3] = (byte) str.charAt(i4);
            i4++;
            i3++;
        }
        bArr[i3] = 0;
        arrayAddToList(bArr, this.n);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getAllCutCmd() {
        return new byte[]{PrinterCommands.ESC, 105};
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBarcodeCmd(BarcodeType barcodeType, BarcodeSetting barcodeSetting, String str) throws SdkException {
        this.n.clear();
        if (barcodeType.equals(BarcodeType.QR_CODE)) {
            int qrcodeDotSize = barcodeSetting.getQrcodeDotSize();
            if (qrcodeDotSize > 15) {
                qrcodeDotSize = 12;
                barcodeSetting.setQrcodeDotSize(12);
            }
            if (qrcodeDotSize < 0) {
                barcodeSetting.setQrcodeDotSize(3);
            }
        } else {
            a(barcodeSetting.getBarcodeStringPosition());
            a(barcodeSetting);
            a(barcodeSetting.getEscBarcodFont());
        }
        String verifiedStr = getVerifiedStr(str, barcodeType);
        switch (AnonymousClass1.a[barcodeType.ordinal()]) {
            case 1:
                UPCA(verifiedStr);
                break;
            case 2:
                UPCE(verifiedStr);
                break;
            case 3:
                EAN13(verifiedStr);
                break;
            case 4:
                EAN8(verifiedStr);
                break;
            case 5:
                CODE39(verifiedStr);
                break;
            case 6:
                ITF(verifiedStr);
                break;
            case 7:
                CODEBAR(verifiedStr);
                break;
            case 8:
                CODE93(verifiedStr);
                break;
            case 9:
                a(verifiedStr);
                break;
            case 10:
                a(verifiedStr, barcodeSetting.getQrcodeDotSize());
                break;
        }
        return listToArray(this.n);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBeepCmd() {
        return a((byte) 1, (byte) 3);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getBitmapCmd(BitmapSetting bitmapSetting, Bitmap bitmap) {
        this.m.clear();
        BitmapUtil bitmapUtil = new BitmapUtil();
        int bimtapLimitWidth = bitmapSetting.getBimtapLimitWidth();
        if (bimtapLimitWidth == 0) {
            bimtapLimitWidth = bitmap.getWidth();
        }
        if (bimtapLimitWidth > 576) {
            bimtapLimitWidth = 576;
        }
        if (bitmapSetting.getBmpPrintMode() == BmpPrintMode.MODE_MULTI_COLOR) {
            arrayAddToList(bitmapUtil.escBitmapPrint(bitmap, bimtapLimitWidth, 0), this.m);
        } else {
            a(bitmap, bimtapLimitWidth);
        }
        return listToArray(this.m);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCRCmd() {
        return e;
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCommonSettingCmd(CommonSetting commonSetting) {
        this.l.clear();
        int align = commonSetting.getAlign();
        Byte bValueOf = Byte.valueOf(PrinterCommands.ESC);
        if (align != -1) {
            this.l.add(bValueOf);
            this.l.add((byte) 97);
            if (commonSetting.getAlign() > 2 || commonSetting.getAlign() < 0) {
                commonSetting.setAlign(0);
            }
            this.l.add(Byte.valueOf((byte) commonSetting.getAlign()));
        }
        if (commonSetting.getPageWidth() != 0) {
            a(commonSetting);
        }
        int escLineSpacing = commonSetting.getEscLineSpacing();
        this.l.add(bValueOf);
        this.l.add((byte) 51);
        this.l.add(Byte.valueOf((byte) escLineSpacing));
        return listToArray(this.l);
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getCpclHeaderCmd(int i2, int i3, int i4, int i5) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawBox(int i2, int i3, int i4, int i5, int i6) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getDrawLine(int i2, int i3, int i4, int i5, int i6) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getEndCmd() {
        try {
            throw new SdkException("Esc doesn't support the method getEndCmd()");
        } catch (SdkException e2) {
            e2.printStackTrace();
            return new byte[0];
        }
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHalfCutCmd() {
        return new byte[]{PrinterCommands.ESC, 109};
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getHeaderCmd() {
        System.out.println("com.rt.printerlibrary.cmd.EscCmd.getHeaderCmd");
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

    public byte[] getPageArea(int i2, int i3, int i4, int i5) {
        return new byte[]{PrinterCommands.ESC, 87, (byte) (i2 % 256), (byte) (i2 / 256), (byte) (i4 % 256), (byte) (i4 / 256)};
    }

    public byte[] getPageEnd(boolean z) {
        return z ? new byte[]{PrinterCommands.CLR} : new byte[]{PrinterCommands.ESC, PrinterCommands.CLR};
    }

    public byte[] getPageMode(boolean z) {
        return z ? new byte[]{PrinterCommands.ESC, 76} : new byte[]{PrinterCommands.ESC, 83};
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getPrintCopies(int i2) {
        return new byte[0];
    }

    public byte[] getPrinterStatus(PrinterAskStatusEnum printerAskStatusEnum) {
        return new byte[]{PrinterCommands.DLE, 4, (byte) printerAskStatusEnum.value()};
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getReverse(int i2, int i3, int i4, int i5) {
        return new byte[0];
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getSelfTestCmd() {
        return b;
    }

    public byte[] getSetAreaWidth(Integer num) {
        return new byte[]{PrinterCommands.GS, 87, (byte) (num.intValue() % 256), (byte) (num.intValue() / 256)};
    }

    public byte[] getSetLeftStartSpacing(Integer num) {
        return new byte[]{PrinterCommands.GS, 76, (byte) (num.intValue() % 256), (byte) (num.intValue() / 256)};
    }

    public byte[] getSetXPosition(Integer num) {
        return new byte[]{PrinterCommands.ESC, 36, (byte) (num.intValue() % 256), (byte) (num.intValue() / 256)};
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getTextCmd(TextSetting textSetting, String str) throws UnsupportedEncodingException {
        return getTextCmd(textSetting, str, getChartsetName());
    }

    @Override // com.rt.printerlibrary.cmd.Cmd
    public byte[] getTextCmd(TextSetting textSetting, String str, String str2) throws UnsupportedEncodingException {
        this.k.clear();
        a(textSetting);
        byte[] bytes = str.getBytes(str2);
        for (byte b2 : bytes) {
            this.k.add(Byte.valueOf(b2));
        }
        return listToArray(this.k);
    }
}
