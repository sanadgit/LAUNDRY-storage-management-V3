package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzit implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ Bundle zzb;
    final /* synthetic */ zzjk zzc;

    zzit(zzjk zzjkVar, zzp zzpVar, Bundle bundle) {
        this.zzc = zzjkVar;
        this.zza = zzpVar;
        this.zzb = bundle;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzed zzedVar = this.zzc.zzb;
        if (zzedVar == null) {
            this.zzc.zzs.zzau().zzb().zza("Failed to send default event parameters to service");
            return;
        }
        try {
            Preconditions.checkNotNull(this.zza);
            zzedVar.zzt(this.zzb, this.zza);
        } catch (RemoteException e) {
            this.zzc.zzs.zzau().zzb().zzb("Failed to send default event parameters to service", e);
        }
    }
}
