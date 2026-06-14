package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzkb extends zzal {
    final /* synthetic */ zzkc zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzkb(zzkc zzkcVar, zzgp zzgpVar) {
        super(zzgpVar);
        this.zza = zzkcVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzal
    public final void zza() {
        this.zza.zzd();
        this.zza.zzs.zzau().zzk().zza("Starting upload from DelayedRunnable");
        this.zza.zzf.zzB();
    }
}
