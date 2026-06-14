package com.aipsoft.aipsoftconnect.Service;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;

/* JADX INFO: loaded from: classes6.dex */
public class Services {
    public static int getSize(Activity activity) {
        return (int) (((double) activity.getResources().getDisplayMetrics().widthPixels) * 0.9d);
    }

    public static SharedPreferences getSP(Context context) {
        return context.getSharedPreferences("pref", 0);
    }

    public static boolean getLoginStatus(SharedPreferences sp) {
        return sp.getBoolean("loginstatus", false);
    }

    public static boolean getBluetoothStatus(SharedPreferences sp) {
        return sp.getBoolean("bluetoothStatus", false);
    }
}
