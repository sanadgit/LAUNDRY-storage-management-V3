package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzak implements Runnable {
    final /* synthetic */ zzgp zza;
    final /* synthetic */ zzal zzb;

    zzak(zzal zzalVar, zzgp zzgpVar) {
        this.zzb = zzalVar;
        this.zza = zzgpVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zza.zzat();
        if (zzz.zza()) {
            this.zza.zzav().zzh(this);
            return;
        }
        boolean zZzc = this.zzb.zzc();
        zzal.zze(this.zzb, 0L);
        if (zZzc) {
            this.zzb.zza();
        }
    }
}
