package com.google.android.gms.measurement.internal;

import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzho implements Runnable {
    final /* synthetic */ AtomicReference zza;
    final /* synthetic */ zzhw zzb;

    zzho(zzhw zzhwVar, AtomicReference atomicReference) {
        this.zzb = zzhwVar;
        this.zza = atomicReference;
    }

    @Override // java.lang.Runnable
    public final void run() {
        synchronized (this.zza) {
            try {
                this.zza.set(Integer.valueOf(this.zzb.zzs.zzc().zzk(this.zzb.zzs.zzA().zzi(), zzea.zzM)));
            } finally {
                this.zza.notify();
            }
        }
    }
}
