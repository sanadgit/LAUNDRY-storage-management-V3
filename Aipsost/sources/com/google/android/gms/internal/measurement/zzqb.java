package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzqb implements zzqa {
    public static final zzht<Boolean> zza = new zzhr(zzhk.zza("com.google.android.gms.measurement")).zzb("measurement.client.reject_blank_user_id", true);

    @Override // com.google.android.gms.internal.measurement.zzqa
    public final boolean zza() {
        return zza.zze().booleanValue();
    }
}
