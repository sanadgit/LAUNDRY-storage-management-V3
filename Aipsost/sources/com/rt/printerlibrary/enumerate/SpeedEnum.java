package com.rt.printerlibrary.enumerate;

import android.text.TextUtils;

/* JADX INFO: loaded from: classes11.dex */
public enum SpeedEnum {
    SPEED_NOT_SET(-1),
    SPEED_0(0),
    SPEED_1(1),
    SPEED_2(2),
    SPEED_3(3),
    SPEED_4(4);

    private int value;

    SpeedEnum(int i) {
        this.value = 0;
        this.value = i;
    }

    public static SpeedEnum getEnumByString(String str) {
        SpeedEnum speedEnum = SPEED_NOT_SET;
        if (TextUtils.isEmpty(str) || str.length() > 1) {
            return speedEnum;
        }
        int i = Integer.parseInt(str);
        for (int i2 = 0; i2 < values().length; i2++) {
            if (i == values()[i2].value) {
                return values()[i2];
            }
        }
        return speedEnum;
    }

    public int value() {
        return this.value;
    }
}
