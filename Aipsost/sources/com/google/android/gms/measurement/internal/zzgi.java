package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgi implements Runnable {
    final /* synthetic */ zzkq zza;
    final /* synthetic */ zzp zzb;
    final /* synthetic */ zzgm zzc;

    zzgi(zzgm zzgmVar, zzkq zzkqVar, zzp zzpVar) {
        this.zzc = zzgmVar;
        this.zza = zzkqVar;
        this.zzb = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzc.zza.zzG();
        if (this.zza.zza() == null) {
            this.zzc.zza.zzK(this.zza, this.zzb);
        } else {
            this.zzc.zza.zzJ(this.zza, this.zzb);
        }
    }
}
