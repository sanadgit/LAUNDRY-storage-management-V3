package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzne implements zznd {
    public static final zzht<Boolean> zza;
    public static final zzht<Boolean> zzb;

    static {
        zzhr zzhrVar = new zzhr(zzhk.zza("com.google.android.gms.measurement"));
        zza = zzhrVar.zzb("measurement.androidId.delete_feature", true);
        zzb = zzhrVar.zzb("measurement.log_androidId_enabled", false);
    }

    @Override // com.google.android.gms.internal.measurement.zznd
    public final boolean zza() {
        return zza.zze().booleanValue();
    }
}
