package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfw implements Runnable {
    final /* synthetic */ zzaa zza;
    final /* synthetic */ zzp zzb;
    final /* synthetic */ zzgm zzc;

    zzfw(zzgm zzgmVar, zzaa zzaaVar, zzp zzpVar) {
        this.zzc = zzgmVar;
        this.zza = zzaaVar;
        this.zzb = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzc.zza.zzG();
        if (this.zza.zzc.zza() == null) {
            this.zzc.zza.zzS(this.zza, this.zzb);
        } else {
            this.zzc.zza.zzQ(this.zza, this.zzb);
        }
    }
}
