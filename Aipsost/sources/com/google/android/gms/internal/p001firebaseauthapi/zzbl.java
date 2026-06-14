package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.concurrent.CopyOnWriteArrayList;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbl {
    private static final CopyOnWriteArrayList zza = new CopyOnWriteArrayList();

    public static zzbk zza(String str) throws GeneralSecurityException {
        for (zzbk zzbkVar : zza) {
            if (zzbkVar.zzb(str)) {
                return zzbkVar;
            }
        }
        throw new GeneralSecurityException("No KMS client does support: ".concat(String.valueOf(str)));
    }
}
