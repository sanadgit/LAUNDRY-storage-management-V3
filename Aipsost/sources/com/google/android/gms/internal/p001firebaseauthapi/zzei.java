package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzei {

    @Deprecated
    public static final zzpb zza;

    @Deprecated
    public static final zzpb zzb;

    @Deprecated
    public static final zzpb zzc;

    static {
        new zzeh();
        new zzef();
        zza = zzpb.zzb();
        zzb = zzpb.zzb();
        zzc = zzpb.zzb();
        try {
            zza();
        } catch (GeneralSecurityException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    public static void zza() throws GeneralSecurityException {
        zzbz.zzo(new zzek());
        zzbz.zzo(new zzem());
        zzcc.zza();
        if (zzdw.zzb()) {
            return;
        }
        zzbz.zzm(new zzef(), new zzeh(), true);
        zzbz.zzm(new zzfc(), new zzfe(), true);
    }
}
