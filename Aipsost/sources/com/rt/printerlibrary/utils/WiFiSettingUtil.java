package com.rt.printerlibrary.utils;

import android.net.wifi.ScanResult;
import com.rt.printerlibrary.cmd.SettingsCmd;
import com.rt.printerlibrary.enumerate.WiFiModeEnum;

/* JADX INFO: loaded from: classes11.dex */
public class WiFiSettingUtil {
    private static final WiFiSettingUtil a = new WiFiSettingUtil();

    private WiFiSettingUtil() {
    }

    public static WiFiSettingUtil getInstance() {
        return a;
    }

    public byte[] setDHCP(boolean z) {
        return SettingsCmd.setDhcp(z);
    }

    public byte[] setStaticIP(String str, String str2, String str3) {
        return SettingsCmd.setStaticIp(str, str2, str3);
    }

    public byte[] setWiFiParam(ScanResult scanResult, String str, WiFiModeEnum wiFiModeEnum) {
        return SettingsCmd.setWifiParam(scanResult, str, wiFiModeEnum);
    }
}
