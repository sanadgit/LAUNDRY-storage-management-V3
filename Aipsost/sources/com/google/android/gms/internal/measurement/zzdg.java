package com.google.android.gms.internal.measurement;

import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.dynamic.ObjectWrapper;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzdg extends zzdt {
    final /* synthetic */ String zza;
    final /* synthetic */ Object zzb;
    final /* synthetic */ zzee zzc;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzdg(zzee zzeeVar, boolean z, int i, String str, Object obj, Object obj2, Object obj3) {
        super(zzeeVar, false);
        this.zzc = zzeeVar;
        this.zza = str;
        this.zzb = obj;
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    final void zza() throws RemoteException {
        ((zzcc) Preconditions.checkNotNull(this.zzc.zzj)).logHealthData(5, this.zza, ObjectWrapper.wrap(this.zzb), ObjectWrapper.wrap(null), ObjectWrapper.wrap(null));
    }
}
