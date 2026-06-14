package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzkw {
    private static final zzkw zza;
    private static final zzkw zzb;

    static {
        zzkt zzktVar = null;
        zza = new zzku(zzktVar);
        zzb = new zzkv(zzktVar);
    }

    /* synthetic */ zzkw(zzkt zzktVar) {
    }

    static zzkw zzc() {
        return zza;
    }

    static zzkw zzd() {
        return zzb;
    }

    abstract void zza(Object obj, long j);

    abstract <L> void zzb(Object obj, Object obj2, long j);
}
