package com.rt.printerlibrary.enumerate;

import androidx.exifinterface.media.ExifInterface;

/* JADX INFO: loaded from: classes11.dex */
public enum ZplFontTypeEnum {
    FONT_A(ExifInterface.GPS_MEASUREMENT_IN_PROGRESS),
    FONT_B("B"),
    FONT_C("C"),
    FONT_D("D"),
    FONT_E(ExifInterface.LONGITUDE_EAST),
    FONT_F("F"),
    FONT_G("G"),
    FONT_DOWNLOAD_FONT("0"),
    FONT_1("1"),
    FONT_2(ExifInterface.GPS_MEASUREMENT_2D),
    FONT_3(ExifInterface.GPS_MEASUREMENT_3D),
    FONT_4("4"),
    FONT_5("5"),
    FONT_6("6"),
    FONT_7("7"),
    FONT_8("8"),
    FONT_9("9");

    private String value;

    ZplFontTypeEnum(String str) {
        this.value = str;
    }

    public String getValue() {
        return this.value;
    }

    public void setValue(String str) {
        this.value = str;
    }
}
