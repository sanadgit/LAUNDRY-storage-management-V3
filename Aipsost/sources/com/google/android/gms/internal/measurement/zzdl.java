package com.google.android.gms.internal.measurement;

import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzdl extends zzdt {
    final /* synthetic */ zzbz zza;
    final /* synthetic */ int zzb;
    final /* synthetic */ zzee zzc;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzdl(zzee zzeeVar, zzbz zzbzVar, int i) {
        super(zzeeVar, true);
        this.zzc = zzeeVar;
        this.zza = zzbzVar;
        this.zzb = i;
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    final void zza() throws RemoteException {
        ((zzcc) Preconditions.checkNotNull(this.zzc.zzj)).getTestFlag(this.zza, this.zzb);
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    protected final void zzb() {
        this.zza.zzb(null);
    }
}
