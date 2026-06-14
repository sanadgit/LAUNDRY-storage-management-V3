package com.google.firebase.auth.internal;

import android.os.Handler;
import android.os.Looper;
import java.util.concurrent.Executor;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbj implements Executor {
    private static final zzbj zza = new zzbj();
    private final Handler zzb = new com.google.android.gms.internal.p001firebaseauthapi.zzg(Looper.getMainLooper());

    private zzbj() {
    }

    public static zzbj zza() {
        return zza;
    }

    @Override // java.util.concurrent.Executor
    public final void execute(Runnable runnable) {
        this.zzb.post(runnable);
    }
}
