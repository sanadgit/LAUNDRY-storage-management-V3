package com.google.android.gms.measurement.internal;

import android.os.Bundle;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzie implements Runnable {
    final /* synthetic */ Bundle zza;
    final /* synthetic */ zzid zzb;
    final /* synthetic */ zzid zzc;
    final /* synthetic */ long zzd;
    final /* synthetic */ zzik zze;

    zzie(zzik zzikVar, Bundle bundle, zzid zzidVar, zzid zzidVar2, long j) {
        this.zze = zzikVar;
        this.zza = bundle;
        this.zzb = zzidVar;
        this.zzc = zzidVar2;
        this.zzd = j;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzik.zzu(this.zze, this.zza, this.zzb, this.zzc, this.zzd);
    }
}
