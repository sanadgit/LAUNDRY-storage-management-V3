package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjg implements Runnable {
    final /* synthetic */ zzed zza;
    final /* synthetic */ zzjj zzb;

    zzjg(zzjj zzjjVar, zzed zzedVar) {
        this.zzb = zzjjVar;
        this.zza = zzedVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        synchronized (this.zzb) {
            zzjj.zzd(this.zzb, false);
            if (!this.zzb.zza.zzh()) {
                this.zzb.zza.zzs.zzau().zzj().zza("Connected to remote service");
                this.zzb.zza.zzE(this.zza);
            }
        }
    }
}
