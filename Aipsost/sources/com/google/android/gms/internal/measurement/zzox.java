package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzox implements zzow {
    public static final zzht<Boolean> zza = new zzhr(zzhk.zza("com.google.android.gms.measurement")).zzb("measurement.ga.ga_app_id", false);

    @Override // com.google.android.gms.internal.measurement.zzow
    public final boolean zza() {
        return true;
    }

    @Override // com.google.android.gms.internal.measurement.zzow
    public final boolean zzb() {
        return zza.zze().booleanValue();
    }
}
