package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfx implements Runnable {
    final /* synthetic */ zzaa zza;
    final /* synthetic */ zzgm zzb;

    zzfx(zzgm zzgmVar, zzaa zzaaVar) {
        this.zzb = zzgmVar;
        this.zza = zzaaVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzb.zza.zzG();
        if (this.zza.zzc.zza() == null) {
            this.zzb.zza.zzR(this.zza);
        } else {
            this.zzb.zza.zzP(this.zza);
        }
    }
}
