package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzih implements Runnable {
    final /* synthetic */ long zza;
    final /* synthetic */ zzik zzb;

    zzih(zzik zzikVar, long j) {
        this.zzb = zzikVar;
        this.zza = j;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzb.zzs.zzB().zzc(this.zza);
        this.zzb.zza = null;
    }
}
