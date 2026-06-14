package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import java.util.Arrays;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzql implements zzjk {
    private final SecretKey zza;
    private final byte[] zzb;
    private final byte[] zzc;

    public zzql(byte[] bArr) throws GeneralSecurityException {
        zzqs.zzb(bArr.length);
        SecretKeySpec secretKeySpec = new SecretKeySpec(bArr, "AES");
        this.zza = secretKeySpec;
        Cipher cipherZzb = zzb();
        cipherZzb.init(1, secretKeySpec);
        byte[] bArrZzb = zziz.zzb(cipherZzb.doFinal(new byte[16]));
        this.zzb = bArrZzb;
        this.zzc = zziz.zzb(bArrZzb);
    }

    private static Cipher zzb() throws GeneralSecurityException {
        if (zzdv.zza(1)) {
            return (Cipher) zzpz.zza.zza("AES/ECB/NoPadding");
        }
        throw new GeneralSecurityException("Can not use AES-CMAC in FIPS-mode.");
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzjk
    public final byte[] zza(byte[] bArr, int i) throws GeneralSecurityException {
        if (i > 16) {
            throw new InvalidAlgorithmParameterException("outputLength too large, max is 16 bytes");
        }
        Cipher cipherZzb = zzb();
        cipherZzb.init(1, this.zza);
        int length = bArr.length;
        int iMax = Math.max(1, (int) Math.ceil(((double) length) / 16.0d));
        byte[] bArrZze = iMax * 16 == length ? zzpp.zze(bArr, (iMax - 1) * 16, this.zzb, 0, 16) : zzpp.zzd(zziz.zza(Arrays.copyOfRange(bArr, (iMax - 1) * 16, length)), this.zzc);
        byte[] bArrDoFinal = new byte[16];
        for (int i2 = 0; i2 < iMax - 1; i2++) {
            bArrDoFinal = cipherZzb.doFinal(zzpp.zze(bArrDoFinal, 0, bArr, i2 * 16, 16));
        }
        return Arrays.copyOf(cipherZzb.doFinal(zzpp.zzd(bArrZze, bArrDoFinal)), i);
    }
}
