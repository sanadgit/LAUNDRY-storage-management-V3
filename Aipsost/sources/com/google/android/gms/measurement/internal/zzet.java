package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzet implements Runnable {
    final /* synthetic */ boolean zza;
    final /* synthetic */ zzeu zzb;

    zzet(zzeu zzeuVar, boolean z) {
        this.zzb = zzeuVar;
        this.zza = z;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzb.zzb.zzV(this.zza);
    }
}
