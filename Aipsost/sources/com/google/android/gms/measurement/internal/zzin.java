package com.google.android.gms.measurement.internal;

import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;
import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzin implements Runnable {
    final /* synthetic */ AtomicReference zza;
    final /* synthetic */ zzp zzb;
    final /* synthetic */ boolean zzc;
    final /* synthetic */ zzjk zzd;

    zzin(zzjk zzjkVar, AtomicReference atomicReference, zzp zzpVar, boolean z) {
        this.zzd = zzjkVar;
        this.zza = atomicReference;
        this.zzb = zzpVar;
        this.zzc = z;
    }

    @Override // java.lang.Runnable
    public final void run() {
        AtomicReference atomicReference;
        zzed zzedVar;
        synchronized (this.zza) {
            try {
                try {
                    zzedVar = this.zzd.zzb;
                } catch (RemoteException e) {
                    this.zzd.zzs.zzau().zzb().zzb("Failed to get all user properties; remote exception", e);
                    atomicReference = this.zza;
                }
                if (zzedVar == null) {
                    this.zzd.zzs.zzau().zzb().zza("Failed to get all user properties; not connected to service");
                    return;
                }
                Preconditions.checkNotNull(this.zzb);
                this.zza.set(zzedVar.zzi(this.zzb, this.zzc));
                this.zzd.zzP();
                atomicReference = this.zza;
                atomicReference.notify();
            } finally {
                this.zza.notify();
            }
        }
    }
}
