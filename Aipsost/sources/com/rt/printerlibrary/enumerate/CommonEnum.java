package com.rt.printerlibrary.enumerate;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/* JADX INFO: loaded from: classes11.dex */
public class CommonEnum {
    public static final int ALIGN_BOTH_SIDES = 3;
    public static final int ALIGN_LEFT = 0;
    public static final int ALIGN_MIDDLE = 1;
    public static final int ALIGN_RIGHT = 2;
    public static final int CHINESE_CODE_MODE_BIG5 = 3;
    public static final int CHINESE_CODE_MODE_GBK = 0;
    public static final int CHINESE_CODE_MODE_UTF8 = 1;
    public static final int CONNECT_STATE_INTERRUPTED = 0;
    public static final int CONNECT_STATE_SUCCESS = 1;
    public static final int Disable = 0;
    public static final int Enable = 1;
    public static final int FONT_STYLE_HOLLOW = 1;
    public static final int FONT_STYLE_HOLLOW_AND_SHADOW = 3;
    public static final int FONT_STYLE_NORMAL = 0;
    public static final int FONT_STYLE_SHADOW = 2;
    public static final int NoSetting = -1;
    public static final int PAGE_HIGH_UNIT_TYPE_INCH = 1;
    public static final int PAGE_HIGH_UNIT_TYPE_ROWS = 0;
    public static final int PIN_PRINT_MODE_Bidirectional = 0;
    public static final int PIN_PRINT_MODE_Full_Bidirectional = 2;
    public static final int PIN_PRINT_MODE_ONEWAY = 1;

    @Retention(RetentionPolicy.SOURCE)
    public @interface Align {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface FontStyle {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface PinPageHighUnitType {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface PinPrintMode {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface PrinterChineseCodeMode {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface PrinterConnectState {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface Setting {
    }
}
