package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zznh implements zzng {
    public static final zzht<Boolean> zza;
    public static final zzht<Boolean> zzb;
    public static final zzht<Long> zzc;

    static {
        zzhr zzhrVar = new zzhr(zzhk.zza("com.google.android.gms.measurement"));
        zza = zzhrVar.zzb("measurement.frontend.directly_maybe_log_error_events", false);
        zzb = zzhrVar.zzb("measurement.upload.directly_maybe_log_error_events", true);
        zzc = zzhrVar.zza("measurement.id.frontend.directly_maybe_log_error_events", 0L);
    }

    @Override // com.google.android.gms.internal.measurement.zzng
    public final boolean zza() {
        return zza.zze().booleanValue();
    }

    @Override // com.google.android.gms.internal.measurement.zzng
    public final boolean zzb() {
        return zzb.zze().booleanValue();
    }
}
