package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzpg implements zzpf {
    public static final zzht<Boolean> zza;
    public static final zzht<Boolean> zzb;

    static {
        zzhr zzhrVar = new zzhr(zzhk.zza("com.google.android.gms.measurement"));
        zza = zzhrVar.zzb("measurement.sdk.screen.manual_screen_view_logging", true);
        zzb = zzhrVar.zzb("measurement.sdk.screen.disabling_automatic_reporting", true);
    }

    @Override // com.google.android.gms.internal.measurement.zzpf
    public final boolean zza() {
        return true;
    }

    @Override // com.google.android.gms.internal.measurement.zzpf
    public final boolean zzb() {
        return zza.zze().booleanValue();
    }

    @Override // com.google.android.gms.internal.measurement.zzpf
    public final boolean zzc() {
        return zzb.zze().booleanValue();
    }
}
