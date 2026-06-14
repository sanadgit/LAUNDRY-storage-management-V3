package com.aipsoft.aipsoftconnect.Service;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/* JADX INFO: loaded from: classes6.dex */
public class BaseEnum {
    public static final int CMD_CPCL = 3;
    public static final int CMD_ESC = 1;
    public static final int CMD_PIN = 5;
    public static final int CMD_TSC = 2;
    public static final int CMD_ZPL = 4;
    public static final int CON_BLUETOOTH = 1;
    public static final int CON_BLUETOOTH_BLE = 2;
    public static final int CON_COM = 5;
    public static final int CON_USB = 4;
    public static final int CON_WIFI = 3;
    public static final int HAS_DEVICE = 1;
    public static final int NONE = -1;
    public static final int NO_DEVICE = -1;

    @Retention(RetentionPolicy.SOURCE)
    public @interface ChooseDevice {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface CmdType {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface ConnectType {
    }
}
