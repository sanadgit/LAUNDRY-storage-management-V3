package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzi implements Runnable {
    final /* synthetic */ com.google.android.gms.internal.measurement.zzcf zza;
    final /* synthetic */ zzas zzb;
    final /* synthetic */ String zzc;
    final /* synthetic */ AppMeasurementDynamiteService zzd;

    zzi(AppMeasurementDynamiteService appMeasurementDynamiteService, com.google.android.gms.internal.measurement.zzcf zzcfVar, zzas zzasVar, String str) {
        this.zzd = appMeasurementDynamiteService;
        this.zza = zzcfVar;
        this.zzb = zzasVar;
        this.zzc = str;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzd.zza.zzy().zzG(this.zza, this.zzb, this.zzc);
    }
}
