package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgk implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ zzgm zzb;

    zzgk(zzgm zzgmVar, zzp zzpVar) {
        this.zzb = zzgmVar;
        this.zza = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzb.zza.zzG();
        this.zzb.zza.zzO(this.zza);
    }
}
