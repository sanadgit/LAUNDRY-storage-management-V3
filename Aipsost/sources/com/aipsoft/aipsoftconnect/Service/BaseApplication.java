package com.aipsoft.aipsoftconnect.Service;

import androidx.exifinterface.media.ExifInterface;
import com.rt.printerlibrary.printer.RTPrinter;
import dagger.hilt.android.HiltAndroidApp;

/* JADX INFO: loaded from: classes6.dex */
@HiltAndroidApp
public class BaseApplication extends Hilt_BaseApplication {
    public static final String SP_NAME_SETTING = "setting";
    private int currentCmdType = 5;
    private int currentConnectType = -1;
    private RTPrinter rtPrinter;
    public static BaseApplication instance = null;
    public static String labelSizeStr = "80*40";
    public static String labelWidth = "80";
    public static String labelHeight = "40";
    public static String labelSpeed = ExifInterface.GPS_MEASUREMENT_2D;
    public static String labelType = "CPCL";
    public static String labelOffset = "0";

    @Override // com.aipsoft.aipsoftconnect.Service.Hilt_BaseApplication, android.app.Application
    public void onCreate() {
        super.onCreate();
        instance = this;
    }

    public static BaseApplication getInstance() {
        return instance;
    }

    public RTPrinter getRtPrinter() {
        return this.rtPrinter;
    }

    public void setRtPrinter(RTPrinter rtPrinter) {
        this.rtPrinter = rtPrinter;
    }

    public int getCurrentCmdType() {
        return this.currentCmdType;
    }

    public void setCurrentCmdType(int currentCmdType) {
        this.currentCmdType = currentCmdType;
    }

    public int getCurrentConnectType() {
        return this.currentConnectType;
    }

    public void setCurrentConnectType(int currentConnectType) {
        this.currentConnectType = currentConnectType;
    }
}
