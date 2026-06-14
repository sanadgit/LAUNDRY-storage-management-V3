package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzit {

    @Deprecated
    public static final zzpb zza;

    @Deprecated
    public static final zzpb zzb;

    @Deprecated
    public static final zzpb zzc;

    static {
        new zzih();
        zzpb zzpbVarZzb = zzpb.zzb();
        zza = zzpbVarZzb;
        zzb = zzpbVarZzb;
        zzc = zzpbVarZzb;
        try {
            zza();
        } catch (GeneralSecurityException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    public static void zza() throws GeneralSecurityException {
        zzbz.zzo(new zziy());
        zzbz.zzn(new zzih(), true);
        zzis.zza();
        if (zzdw.zzb()) {
            return;
        }
        zzbz.zzn(new zzhq(), true);
        zzia.zza();
    }
}
