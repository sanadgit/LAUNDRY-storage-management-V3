package com.google.zxing.integration.android;

/* JADX INFO: loaded from: classes11.dex */
public final class IntentResult {
    private final String barcodeImagePath;
    private final String contents;
    private final String errorCorrectionLevel;
    private final String formatName;
    private final Integer orientation;
    private final byte[] rawBytes;

    IntentResult() {
        this(null, null, null, null, null, null);
    }

    IntentResult(String contents, String formatName, byte[] rawBytes, Integer orientation, String errorCorrectionLevel, String barcodeImagePath) {
        this.contents = contents;
        this.formatName = formatName;
        this.rawBytes = rawBytes;
        this.orientation = orientation;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.barcodeImagePath = barcodeImagePath;
    }

    public String getContents() {
        return this.contents;
    }

    public String getFormatName() {
        return this.formatName;
    }

    public byte[] getRawBytes() {
        return this.rawBytes;
    }

    public Integer getOrientation() {
        return this.orientation;
    }

    public String getErrorCorrectionLevel() {
        return this.errorCorrectionLevel;
    }

    public String getBarcodeImagePath() {
        return this.barcodeImagePath;
    }

    public String toString() {
        byte[] bArr = this.rawBytes;
        int rawBytesLength = bArr == null ? 0 : bArr.length;
        return "Format: " + this.formatName + "\nContents: " + this.contents + "\nRaw bytes: (" + rawBytesLength + " bytes)\nOrientation: " + this.orientation + "\nEC level: " + this.errorCorrectionLevel + "\nBarcode image: " + this.barcodeImagePath + '\n';
    }
}
