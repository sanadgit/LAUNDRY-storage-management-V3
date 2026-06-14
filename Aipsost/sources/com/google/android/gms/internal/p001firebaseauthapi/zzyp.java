package com.google.android.gms.internal.p001firebaseauthapi;

import android.app.Activity;
import androidx.collection.ArrayMap;
import com.google.android.gms.common.util.DefaultClock;
import com.google.firebase.auth.PhoneAuthProvider;
import java.util.Map;
import java.util.concurrent.Executor;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzyp {
    private static final Map zza = new ArrayMap();

    public static PhoneAuthProvider.OnVerificationStateChangedCallbacks zza(String str, PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, zzyb zzybVar) {
        zze(str, zzybVar);
        return new zzyn(onVerificationStateChangedCallbacks, str);
    }

    public static void zzc() {
        zza.clear();
    }

    public static boolean zzd(String str, PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Activity activity, Executor executor) {
        Map map = zza;
        if (!map.containsKey(str)) {
            zze(str, null);
            return false;
        }
        zzyo zzyoVar = (zzyo) map.get(str);
        if (DefaultClock.getInstance().currentTimeMillis() - zzyoVar.zzb >= 120000) {
            zze(str, null);
            return false;
        }
        zzyb zzybVar = zzyoVar.zza;
        if (zzybVar == null) {
            return true;
        }
        zzybVar.zzh(onVerificationStateChangedCallbacks, activity, executor, str);
        return true;
    }

    private static void zze(String str, zzyb zzybVar) {
        zza.put(str, new zzyo(zzybVar, DefaultClock.getInstance().currentTimeMillis()));
    }
}
