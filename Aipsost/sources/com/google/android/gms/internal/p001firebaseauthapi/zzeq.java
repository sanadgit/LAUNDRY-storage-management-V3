package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzeq implements zzet {
    private final int zza;

    zzeq(int i) throws InvalidAlgorithmParameterException {
        if (i == 16 || i == 32) {
            this.zza = i;
            return;
        }
        throw new InvalidAlgorithmParameterException("Unsupported key length: " + i);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzet
    public final int zza() {
        return this.zza;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzet
    public final byte[] zzc(byte[] bArr, byte[] bArr2, byte[] bArr3, byte[] bArr4) throws GeneralSecurityException {
        int length = bArr.length;
        if (length == this.zza) {
            return new zzdl(bArr, false).zza(bArr2, bArr3, bArr4);
        }
        throw new InvalidAlgorithmParameterException("Unexpected key length: " + length);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzet
    public final byte[] zzb() throws GeneralSecurityException {
        switch (this.zza) {
            case 16:
                return zzff.zzi;
            case 32:
                return zzff.zzj;
            default:
                throw new GeneralSecurityException("Could not determine HPKE AEAD ID");
        }
    }
}
