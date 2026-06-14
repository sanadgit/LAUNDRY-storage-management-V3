package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzif implements Runnable {
    final /* synthetic */ zzid zza;
    final /* synthetic */ zzid zzb;
    final /* synthetic */ long zzc;
    final /* synthetic */ boolean zzd;
    final /* synthetic */ zzik zze;

    zzif(zzik zzikVar, zzid zzidVar, zzid zzidVar2, long j, boolean z) {
        this.zze = zzikVar;
        this.zza = zzidVar;
        this.zzb = zzidVar2;
        this.zzc = j;
        this.zzd = z;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zze.zzB(this.zza, this.zzb, this.zzc, this.zzd, null);
    }
}
