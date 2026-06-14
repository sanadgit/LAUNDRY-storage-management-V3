package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgm {
    private static final zzgm zza = new zzgm();
    private static final zzgl zzb = new zzgl(null);
    private final AtomicReference zzc = new AtomicReference();

    public static zzgm zza() {
        return zza;
    }

    public final zzje zzb() {
        zzje zzjeVar = (zzje) this.zzc.get();
        return zzjeVar == null ? zzb : zzjeVar;
    }
}
