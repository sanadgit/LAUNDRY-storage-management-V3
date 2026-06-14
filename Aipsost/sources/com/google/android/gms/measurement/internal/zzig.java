package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzig implements Runnable {
    final /* synthetic */ zzik zza;

    zzig(zzik zzikVar) {
        this.zza = zzikVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzik zzikVar = this.zza;
        zzikVar.zza = zzikVar.zzh;
    }
}
