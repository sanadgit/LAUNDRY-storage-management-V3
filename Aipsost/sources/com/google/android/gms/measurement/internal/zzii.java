package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzii implements Runnable {
    final /* synthetic */ zzid zza;
    final /* synthetic */ long zzb;
    final /* synthetic */ zzik zzc;

    zzii(zzik zzikVar, zzid zzidVar, long j) {
        this.zzc = zzikVar;
        this.zza = zzidVar;
        this.zzb = j;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzc.zzC(this.zza, false, this.zzb);
        zzik zzikVar = this.zzc;
        zzikVar.zza = null;
        zzikVar.zzs.zzy().zzz(null);
    }
}
