package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgd implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ zzgm zzb;

    zzgd(zzgm zzgmVar, zzp zzpVar) {
        this.zzb = zzgmVar;
        this.zza = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzb.zza.zzG();
        zzkn zzknVar = this.zzb.zza;
        zzp zzpVar = this.zza;
        zzknVar.zzav().zzg();
        zzknVar.zzr();
        Preconditions.checkNotEmpty(zzpVar.zza);
        zzknVar.zzT(zzpVar);
    }
}
