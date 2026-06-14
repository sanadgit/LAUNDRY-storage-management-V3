package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzea {
    public static final String zza;

    @Deprecated
    public static final zzpb zzb;

    @Deprecated
    public static final zzpb zzc;

    static {
        new zzdz();
        zza = "type.googleapis.com/google.crypto.tink.AesSivKey";
        zzb = zzpb.zzb();
        zzc = zzpb.zzb();
        try {
            zzbz.zzo(new zzec());
            if (zzdw.zzb()) {
                return;
            }
            zzbz.zzn(new zzdz(), true);
        } catch (GeneralSecurityException e) {
            throw new ExceptionInInitializerError(e);
        }
    }
}
