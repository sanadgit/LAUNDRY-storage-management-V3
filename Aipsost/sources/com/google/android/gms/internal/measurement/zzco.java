package com.google.android.gms.internal.measurement;

import android.os.Bundle;
import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzco extends zzdt {
    final /* synthetic */ String zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ Bundle zzc;
    final /* synthetic */ zzee zzd;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzco(zzee zzeeVar, String str, String str2, Bundle bundle) {
        super(zzeeVar, true);
        this.zzd = zzeeVar;
        this.zza = str;
        this.zzb = str2;
        this.zzc = bundle;
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    final void zza() throws RemoteException {
        ((zzcc) Preconditions.checkNotNull(this.zzd.zzj)).clearConditionalUserProperty(this.zza, this.zzb, this.zzc);
    }
}
