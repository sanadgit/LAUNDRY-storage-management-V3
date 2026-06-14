package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.interfaces.ECPublicKey;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzpu implements zzav {
    private final zzpw zza;
    private final String zzb;
    private final byte[] zzc;
    private final zzps zzd;

    public zzpu(ECPublicKey eCPublicKey, byte[] bArr, String str, int i, zzps zzpsVar) throws GeneralSecurityException {
        zzpx.zze(eCPublicKey.getW(), eCPublicKey.getParams().getCurve());
        this.zza = new zzpw(eCPublicKey);
        this.zzc = bArr;
        this.zzb = str;
        this.zzd = zzpsVar;
    }
}
