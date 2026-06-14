package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzk implements Runnable {
    final /* synthetic */ zzn zza;
    final /* synthetic */ AppMeasurementDynamiteService zzb;

    zzk(AppMeasurementDynamiteService appMeasurementDynamiteService, zzn zznVar) {
        this.zzb = appMeasurementDynamiteService;
        this.zza = zznVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzb.zza.zzk().zzI(this.zza);
    }
}
