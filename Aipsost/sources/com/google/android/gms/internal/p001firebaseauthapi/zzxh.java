package com.google.android.gms.internal.p001firebaseauthapi;

import android.content.Context;
import com.google.android.gms.common.GoogleApiAvailabilityLight;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzxh {
    private static Boolean zza = null;

    public static boolean zza(Context context) {
        if (zza == null) {
            int iIsGooglePlayServicesAvailable = GoogleApiAvailabilityLight.getInstance().isGooglePlayServicesAvailable(context, 12451000);
            boolean z = true;
            if (iIsGooglePlayServicesAvailable != 0 && iIsGooglePlayServicesAvailable != 2) {
                z = false;
            }
            zza = Boolean.valueOf(z);
        }
        return zza.booleanValue();
    }
}
