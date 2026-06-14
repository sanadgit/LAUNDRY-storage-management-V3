package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbg {
    public static zzbf zza(String str) throws GeneralSecurityException {
        zzbf zzbfVar = (zzbf) zzbz.zzl().get(str);
        if (zzbfVar != null) {
            return zzbfVar;
        }
        throw new GeneralSecurityException("cannot find key template: ".concat(str));
    }
}
