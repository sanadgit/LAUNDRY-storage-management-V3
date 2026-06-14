package com.google.android.gms.internal.measurement;

import android.os.Bundle;
import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzdh extends zzdt {
    final /* synthetic */ Bundle zza;
    final /* synthetic */ zzbz zzb;
    final /* synthetic */ zzee zzc;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzdh(zzee zzeeVar, Bundle bundle, zzbz zzbzVar) {
        super(zzeeVar, true);
        this.zzc = zzeeVar;
        this.zza = bundle;
        this.zzb = zzbzVar;
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    final void zza() throws RemoteException {
        ((zzcc) Preconditions.checkNotNull(this.zzc.zzj)).performAction(this.zza, this.zzb, this.zzh);
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    protected final void zzb() {
        this.zzb.zzb(null);
    }
}
