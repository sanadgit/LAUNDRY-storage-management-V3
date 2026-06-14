package com.google.android.gms.internal.measurement;

import android.app.Activity;
import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.dynamic.ObjectWrapper;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzdy extends zzdt {
    final /* synthetic */ Activity zza;
    final /* synthetic */ zzed zzb;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzdy(zzed zzedVar, Activity activity) {
        super(zzedVar.zza, true);
        this.zzb = zzedVar;
        this.zza = activity;
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    final void zza() throws RemoteException {
        ((zzcc) Preconditions.checkNotNull(this.zzb.zza.zzj)).onActivityResumed(ObjectWrapper.wrap(this.zza), this.zzi);
    }
}
