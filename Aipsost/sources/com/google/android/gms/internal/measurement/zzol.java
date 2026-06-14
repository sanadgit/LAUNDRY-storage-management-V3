package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzol implements zzok {
    public static final zzht<Boolean> zza = new zzhr(zzhk.zza("com.google.android.gms.measurement")).zzb("measurement.service.use_appinfo_modified", true);

    @Override // com.google.android.gms.internal.measurement.zzok
    public final boolean zza() {
        return true;
    }

    @Override // com.google.android.gms.internal.measurement.zzok
    public final boolean zzb() {
        return zza.zze().booleanValue();
    }
}
