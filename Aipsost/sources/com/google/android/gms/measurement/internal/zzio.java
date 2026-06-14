package com.google.android.gms.measurement.internal;

import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzio implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ zzjk zzb;

    zzio(zzjk zzjkVar, zzp zzpVar) {
        this.zzb = zzjkVar;
        this.zza = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzed zzedVar = this.zzb.zzb;
        if (zzedVar == null) {
            this.zzb.zzs.zzau().zzb().zza("Failed to reset data on the service: not connected to service");
            return;
        }
        try {
            Preconditions.checkNotNull(this.zza);
            zzedVar.zzs(this.zza);
        } catch (RemoteException e) {
            this.zzb.zzs.zzau().zzb().zzb("Failed to reset data on the service: remote exception", e);
        }
        this.zzb.zzP();
    }
}
