package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zziw extends zzal {
    final /* synthetic */ zzjk zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zziw(zzjk zzjkVar, zzgp zzgpVar) {
        super(zzgpVar);
        this.zza = zzjkVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzal
    public final void zza() {
        this.zza.zzs.zzau().zze().zza("Tasks have been queued for a long time");
    }
}
