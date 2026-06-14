package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgg implements Runnable {
    final /* synthetic */ zzas zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ zzgm zzc;

    zzgg(zzgm zzgmVar, zzas zzasVar, String str) {
        this.zzc = zzgmVar;
        this.zza = zzasVar;
        this.zzb = str;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzc.zza.zzG();
        this.zzc.zza.zzv(this.zza, this.zzb);
    }
}
