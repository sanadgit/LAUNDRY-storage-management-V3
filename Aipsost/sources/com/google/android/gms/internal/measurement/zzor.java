package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzor implements zzoq {
    public static final zzht<Boolean> zza;
    public static final zzht<Boolean> zzb;
    public static final zzht<Long> zzc;

    static {
        zzhr zzhrVar = new zzhr(zzhk.zza("com.google.android.gms.measurement"));
        zza = zzhrVar.zzb("measurement.collection.efficient_engagement_reporting_enabled_2", true);
        zzb = zzhrVar.zzb("measurement.collection.redundant_engagement_removal_enabled", false);
        zzc = zzhrVar.zza("measurement.id.collection.redundant_engagement_removal_enabled", 0L);
    }

    @Override // com.google.android.gms.internal.measurement.zzoq
    public final boolean zza() {
        return zzb.zze().booleanValue();
    }
}
