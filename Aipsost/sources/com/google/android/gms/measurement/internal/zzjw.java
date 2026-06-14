package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjw extends zzal {
    final /* synthetic */ zzjx zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzjw(zzjx zzjxVar, zzgp zzgpVar) {
        super(zzgpVar);
        this.zza = zzjxVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzal
    public final void zza() {
        zzjx zzjxVar = this.zza;
        zzjxVar.zzc.zzg();
        zzjxVar.zzd(false, false, zzjxVar.zzc.zzs.zzay().elapsedRealtime());
        zzjxVar.zzc.zzs.zzB().zzc(zzjxVar.zzc.zzs.zzay().elapsedRealtime());
    }
}
