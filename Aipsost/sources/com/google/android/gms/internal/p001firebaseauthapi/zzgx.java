package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzgx extends zzgc {
    private final Class zza;

    @SafeVarargs
    protected zzgx(Class cls, Class cls2, zzgw... zzgwVarArr) {
        super(cls, zzgwVarArr);
        this.zza = cls2;
    }

    public abstract zzaek zzg(zzaek zzaekVar) throws GeneralSecurityException;
}
