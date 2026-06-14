package com.google.android.gms.measurement.internal;

import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhn implements Runnable {
    final /* synthetic */ AtomicReference zza;
    final /* synthetic */ zzhw zzb;

    zzhn(zzhw zzhwVar, AtomicReference atomicReference) {
        this.zzb = zzhwVar;
        this.zza = atomicReference;
    }

    @Override // java.lang.Runnable
    public final void run() {
        synchronized (this.zza) {
            try {
                this.zza.set(Long.valueOf(this.zzb.zzs.zzc().zzj(this.zzb.zzs.zzA().zzi(), zzea.zzL)));
            } finally {
                this.zza.notify();
            }
        }
    }
}
