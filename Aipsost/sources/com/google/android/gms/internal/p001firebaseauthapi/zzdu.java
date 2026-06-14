package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.spec.AlgorithmParameterSpec;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzdu implements zzap {
    private static final ThreadLocal zza = new zzdt();
    private final SecretKey zzb;

    public zzdu(byte[] bArr) throws GeneralSecurityException {
        zzqs.zzb(bArr.length);
        this.zzb = new SecretKeySpec(bArr, "AES");
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzap
    public final byte[] zza(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        AlgorithmParameterSpec ivParameterSpec;
        if (bArr.length < 28) {
            throw new GeneralSecurityException("ciphertext too short");
        }
        try {
            Class.forName("javax.crypto.spec.GCMParameterSpec");
            ivParameterSpec = new GCMParameterSpec(128, bArr, 0, 12);
        } catch (ClassNotFoundException e) {
            if (!zzqr.zza()) {
                throw new GeneralSecurityException("cannot use AES-GCM: javax.crypto.spec.GCMParameterSpec not found");
            }
            ivParameterSpec = new IvParameterSpec(bArr, 0, 12);
        }
        ThreadLocal threadLocal = zza;
        ((Cipher) threadLocal.get()).init(2, this.zzb, ivParameterSpec);
        return ((Cipher) threadLocal.get()).doFinal(bArr, 12, bArr.length - 12);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzap
    public final byte[] zzb(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        throw null;
    }
}
