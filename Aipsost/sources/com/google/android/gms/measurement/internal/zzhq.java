package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhq implements Runnable {
    final /* synthetic */ Boolean zza;
    final /* synthetic */ zzhw zzb;

    zzhq(zzhw zzhwVar, Boolean bool) {
        this.zzb = zzhwVar;
        this.zza = bool;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzb.zzY(this.zza, true);
    }
}
