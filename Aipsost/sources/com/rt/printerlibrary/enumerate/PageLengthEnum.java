package com.rt.printerlibrary.enumerate;

/* JADX INFO: loaded from: classes11.dex */
public enum PageLengthEnum {
    NO_SETTING(-1),
    INCH_3(0),
    INCH_11_divided_by_3(1),
    INCH_3_5(2),
    INCH_4(3),
    INCH_5(4),
    INCH_5_5(5),
    INCH_6(6),
    INCH_7(7),
    INCH_11(8),
    INCH_A4_11_6(9),
    INCH_12(10),
    INCH_14(11);

    private int value;

    PageLengthEnum(int i) {
        this.value = 0;
        this.value = i;
    }

    public int value() {
        return this.value;
    }
}
