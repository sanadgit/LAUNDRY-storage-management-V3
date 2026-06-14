package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzje implements Runnable {
    final /* synthetic */ zzed zza;
    final /* synthetic */ zzjj zzb;

    zzje(zzjj zzjjVar, zzed zzedVar) {
        this.zzb = zzjjVar;
        this.zza = zzedVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        synchronized (this.zzb) {
            zzjj.zzd(this.zzb, false);
            if (!this.zzb.zza.zzh()) {
                this.zzb.zza.zzs.zzau().zzk().zza("Connected to service");
                this.zzb.zza.zzE(this.zza);
            }
        }
    }
}
