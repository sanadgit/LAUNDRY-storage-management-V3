package com.google.firebase.messaging;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import com.google.android.gms.stats.WakeLock;
import java.util.concurrent.TimeUnit;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
final class WakeLockHolder {
    private static final long WAKE_LOCK_ACQUIRE_TIMEOUT_MILLIS = TimeUnit.MINUTES.toMillis(1);
    private static final Object syncObject = new Object();
    private static WakeLock wakeLock;

    private static void checkAndInitWakeLock(Context context) {
        if (wakeLock == null) {
            WakeLock wakeLock2 = new WakeLock(context, 1, "wake:com.google.firebase.iid.WakeLockHolder");
            wakeLock = wakeLock2;
            wakeLock2.setReferenceCounted(true);
        }
    }

    static void completeWakefulIntent(Intent intent) {
        synchronized (syncObject) {
            if (wakeLock != null && isWakefulIntent(intent)) {
                setAsWakefulIntent(intent, false);
                wakeLock.release();
            }
        }
    }

    static boolean isWakefulIntent(Intent intent) {
        return intent.getBooleanExtra("com.google.firebase.iid.WakeLockHolder.wakefulintent", false);
    }

    private static void setAsWakefulIntent(Intent intent, boolean z) {
        intent.putExtra("com.google.firebase.iid.WakeLockHolder.wakefulintent", z);
    }

    static ComponentName startWakefulService(Context context, Intent intent) {
        synchronized (syncObject) {
            checkAndInitWakeLock(context);
            boolean zIsWakefulIntent = isWakefulIntent(intent);
            setAsWakefulIntent(intent, true);
            ComponentName componentNameStartService = context.startService(intent);
            if (componentNameStartService == null) {
                return null;
            }
            if (!zIsWakefulIntent) {
                wakeLock.acquire(WAKE_LOCK_ACQUIRE_TIMEOUT_MILLIS);
            }
            return componentNameStartService;
        }
    }
}
