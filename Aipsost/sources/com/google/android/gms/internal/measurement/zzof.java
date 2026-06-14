package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzof implements zzoe {
    public static final zzht<Boolean> zza = new zzhr(zzhk.zza("com.google.android.gms.measurement")).zzb("measurement.client.consent.suppress_1p_in_ga4f_install", true);

    @Override // com.google.android.gms.internal.measurement.zzoe
    public final boolean zza() {
        return true;
    }

    @Override // com.google.android.gms.internal.measurement.zzoe
    public final boolean zzb() {
        return zza.zze().booleanValue();
    }
}
