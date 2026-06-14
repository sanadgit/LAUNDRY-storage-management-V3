package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzha implements Runnable {
    final /* synthetic */ zzhw zza;

    zzha(zzhw zzhwVar) {
        this.zza = zzhwVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zza.zzb.zza();
    }
}
