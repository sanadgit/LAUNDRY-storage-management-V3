package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzqo implements zzbm {
    private final zzjk zza;
    private final int zzb;

    public zzqo(zzjk zzjkVar, int i) throws GeneralSecurityException {
        this.zza = zzjkVar;
        this.zzb = i;
        if (i < 10) {
            throw new InvalidAlgorithmParameterException("tag size too small, need at least 10 bytes");
        }
        zzjkVar.zza(new byte[0], i);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbm
    public final void zza(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        if (!zzpp.zzb(this.zza.zza(bArr2, this.zzb), bArr)) {
            throw new GeneralSecurityException("invalid MAC");
        }
    }
}
