package com.google.android.gms.internal.p001firebaseauthapi;

import android.util.Log;
import java.security.GeneralSecurityException;
import java.security.InvalidKeyException;
import java.security.KeyStore;
import java.security.ProviderException;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfo implements zzap {
    private static final String zza = zzfo.class.getSimpleName();
    private final SecretKey zzb;

    zzfo(String str, KeyStore keyStore) throws GeneralSecurityException {
        SecretKey secretKey = (SecretKey) keyStore.getKey(str, null);
        this.zzb = secretKey;
        if (secretKey == null) {
            throw new InvalidKeyException("Keystore cannot load the key with ID: ".concat(String.valueOf(str)));
        }
    }

    private static void zzc() {
        try {
            Thread.sleep((int) (Math.random() * 100.0d));
        } catch (InterruptedException e) {
        }
    }

    private final byte[] zzd(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        int length = bArr.length;
        if (length < 28) {
            throw new GeneralSecurityException("ciphertext too short");
        }
        GCMParameterSpec gCMParameterSpec = new GCMParameterSpec(128, bArr, 0, 12);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(2, this.zzb, gCMParameterSpec);
        cipher.updateAAD(bArr2);
        return cipher.doFinal(bArr, 12, length - 12);
    }

    private final byte[] zze(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        int length = bArr.length;
        if (length > 2147483619) {
            throw new GeneralSecurityException("plaintext too long");
        }
        byte[] bArr3 = new byte[length + 28];
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(1, this.zzb);
        cipher.updateAAD(bArr2);
        cipher.doFinal(bArr, 0, length, bArr3, 12);
        System.arraycopy(cipher.getIV(), 0, bArr3, 0, 12);
        return bArr3;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzap
    public final byte[] zza(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        try {
            return zzd(bArr, bArr2);
        } catch (GeneralSecurityException | ProviderException e) {
            Log.w(zza, "encountered a potentially transient KeyStore error, will wait and retry", e);
            zzc();
            return zzd(bArr, bArr2);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzap
    public final byte[] zzb(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        try {
            return zze(bArr, bArr2);
        } catch (GeneralSecurityException | ProviderException e) {
            Log.w(zza, "encountered a potentially transient KeyStore error, will wait and retry", e);
            zzc();
            return zze(bArr, bArr2);
        }
    }
}
