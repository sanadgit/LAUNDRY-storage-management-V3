package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzn implements zzgu {
    public final com.google.android.gms.internal.measurement.zzci zza;
    final /* synthetic */ AppMeasurementDynamiteService zzb;

    zzn(AppMeasurementDynamiteService appMeasurementDynamiteService, com.google.android.gms.internal.measurement.zzci zzciVar) {
        this.zzb = appMeasurementDynamiteService;
        this.zza = zzciVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzgu
    public final void interceptEvent(String str, String str2, Bundle bundle, long j) {
        try {
            this.zza.zzd(str, str2, bundle, j);
        } catch (RemoteException e) {
            zzfu zzfuVar = this.zzb.zza;
            if (zzfuVar != null) {
                zzfuVar.zzau().zze().zzb("Event interceptor threw exception", e);
            }
        }
    }
}
