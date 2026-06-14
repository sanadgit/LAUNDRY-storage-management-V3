package com.aipsoft.aipsoftconnect.Service;

import android.util.Log;

/* JADX INFO: loaded from: classes6.dex */
public class TimeRecordUtils {
    public static synchronized void record(String describe, long timemills) {
        Log.e("Fu", timemills + "\t" + describe);
    }
}
