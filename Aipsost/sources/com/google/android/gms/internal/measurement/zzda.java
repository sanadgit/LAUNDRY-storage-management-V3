package com.google.android.gms.internal.measurement;

import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzda extends zzdt {
    final /* synthetic */ zzbz zza;
    final /* synthetic */ zzee zzb;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzda(zzee zzeeVar, zzbz zzbzVar) {
        super(zzeeVar, true);
        this.zzb = zzeeVar;
        this.zza = zzbzVar;
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    final void zza() throws RemoteException {
        ((zzcc) Preconditions.checkNotNull(this.zzb.zzj)).getGmpAppId(this.zza);
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    protected final void zzb() {
        this.zza.zzb(null);
    }
}
