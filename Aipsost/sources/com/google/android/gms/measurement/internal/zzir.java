package com.google.android.gms.measurement.internal;

import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzir implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ zzjk zzb;

    zzir(zzjk zzjkVar, zzp zzpVar) {
        this.zzb = zzjkVar;
        this.zza = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() throws Throwable {
        zzed zzedVar = this.zzb.zzb;
        if (zzedVar == null) {
            this.zzb.zzs.zzau().zzb().zza("Discarding data. Failed to send app launch");
            return;
        }
        try {
            Preconditions.checkNotNull(this.zza);
            zzedVar.zzf(this.zza);
            this.zzb.zzs.zzn().zzn();
            this.zzb.zzk(zzedVar, null, this.zza);
            this.zzb.zzP();
        } catch (RemoteException e) {
            this.zzb.zzs.zzau().zzb().zzb("Failed to send app launch to the service", e);
        }
    }
}
