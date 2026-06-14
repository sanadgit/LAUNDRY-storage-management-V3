package com.google.android.gms.measurement.internal;

import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhf implements Runnable {
    final /* synthetic */ long zza;
    final /* synthetic */ zzhw zzb;

    zzhf(zzhw zzhwVar, long j) {
        this.zzb = zzhwVar;
        this.zza = j;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzb.zzG(this.zza, true);
        this.zzb.zzs.zzy().zzv(new AtomicReference<>());
    }
}
