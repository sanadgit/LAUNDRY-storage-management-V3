package com.rt.printerlibrary.setting;

import com.rt.printerlibrary.bean.Position;
import com.rt.printerlibrary.enumerate.BarcodeStringPosition;
import com.rt.printerlibrary.enumerate.ESCBarcodeFontTypeEnum;
import com.rt.printerlibrary.enumerate.EscBarcodePrintOritention;
import com.rt.printerlibrary.enumerate.PrintRotation;
import com.rt.printerlibrary.enumerate.QrcodeEccLevel;

/* JADX INFO: loaded from: classes11.dex */
public class BarcodeSetting {
    private BarcodeStringPosition barcodeStringPosition;
    private Position position;
    private EscBarcodePrintOritention escBarcodePrintOritention = EscBarcodePrintOritention.Rotate0;
    private int qrcodeDotSize = 7;
    private QrcodeEccLevel qrcodeEccLevel = QrcodeEccLevel.L;
    private PrintRotation printRotation = PrintRotation.Rotate0;
    private int heightInDot = 72;
    private int barcodeWidth = 3;
    private int narrowInDot = 2;
    private int wideInDot = 4;
    private ESCBarcodeFontTypeEnum EscBarfonttype = ESCBarcodeFontTypeEnum.BARFONT_A_12x24;

    public BarcodeStringPosition getBarcodeStringPosition() {
        return this.barcodeStringPosition;
    }

    public int getBarcodeWidth() {
        return this.barcodeWidth;
    }

    public ESCBarcodeFontTypeEnum getEscBarcodFont() {
        return this.EscBarfonttype;
    }

    public EscBarcodePrintOritention getEscBarcodePrintOritention() {
        return this.escBarcodePrintOritention;
    }

    public int getHeightInDot() {
        return this.heightInDot;
    }

    public int getNarrowInDot() {
        return this.narrowInDot;
    }

    public Position getPosition() {
        return this.position;
    }

    public PrintRotation getPrintRotation() {
        return this.printRotation;
    }

    public int getQrcodeDotSize() {
        return this.qrcodeDotSize;
    }

    public QrcodeEccLevel getQrcodeEccLevel() {
        return this.qrcodeEccLevel;
    }

    public int getWideInDot() {
        return this.wideInDot;
    }

    public void setBarcodeStringPosition(BarcodeStringPosition barcodeStringPosition) {
        this.barcodeStringPosition = barcodeStringPosition;
    }

    public void setBarcodeWidth(int i) {
        this.barcodeWidth = i;
    }

    public void setEscBarcodFont(ESCBarcodeFontTypeEnum eSCBarcodeFontTypeEnum) {
        this.EscBarfonttype = eSCBarcodeFontTypeEnum;
    }

    @Deprecated
    public void setEscBarcodePrintOritention(EscBarcodePrintOritention escBarcodePrintOritention) {
        this.escBarcodePrintOritention = escBarcodePrintOritention;
    }

    public void setHeightInDot(int i) {
        this.heightInDot = i;
    }

    public void setNarrowInDot(int i) {
        this.narrowInDot = i;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public void setPrintRotation(PrintRotation printRotation) {
        this.printRotation = printRotation;
    }

    public void setQrcodeDotSize(int i) {
        this.qrcodeDotSize = i;
    }

    public void setQrcodeEccLevel(QrcodeEccLevel qrcodeEccLevel) {
        this.qrcodeEccLevel = qrcodeEccLevel;
    }

    public void setWideInDot(int i) {
        this.wideInDot = i;
    }
}
