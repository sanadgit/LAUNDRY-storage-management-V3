package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzpm implements zzpl {
    public static final zzht<Boolean> zza;
    public static final zzht<Long> zzb;

    static {
        zzhr zzhrVar = new zzhr(zzhk.zza("com.google.android.gms.measurement"));
        zza = zzhrVar.zzb("measurement.validation.internal_limits_internal_event_params", false);
        zzb = zzhrVar.zza("measurement.id.validation.internal_limits_internal_event_params", 0L);
    }

    @Override // com.google.android.gms.internal.measurement.zzpl
    public final boolean zza() {
        return zza.zze().booleanValue();
    }
}
