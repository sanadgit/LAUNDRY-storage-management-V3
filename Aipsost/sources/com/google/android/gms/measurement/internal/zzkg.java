package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzkg implements Runnable {
    final /* synthetic */ zzko zza;
    final /* synthetic */ zzkn zzb;

    zzkg(zzkn zzknVar, zzko zzkoVar) {
        this.zzb = zzknVar;
        this.zza = zzkoVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzkn.zzW(this.zzb, this.zza);
        this.zzb.zzc();
    }
}
