package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zznw implements zznv {
    public static final zzht<Boolean> zza;
    public static final zzht<Boolean> zzb;

    static {
        zzhr zzhrVar = new zzhr(zzhk.zza("com.google.android.gms.measurement"));
        zza = zzhrVar.zzb("measurement.euid.client.dev", false);
        zzb = zzhrVar.zzb("measurement.euid.service", false);
    }

    @Override // com.google.android.gms.internal.measurement.zznv
    public final boolean zza() {
        return zza.zze().booleanValue();
    }

    @Override // com.google.android.gms.internal.measurement.zznv
    public final boolean zzb() {
        return zzb.zze().booleanValue();
    }
}
