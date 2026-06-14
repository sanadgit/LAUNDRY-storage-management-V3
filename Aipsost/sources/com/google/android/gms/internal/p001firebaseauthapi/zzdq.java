package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.InvalidKeyException;
import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzdq extends zzdn {
    public zzdq(byte[] bArr, int i) throws InvalidKeyException {
        super(bArr, i);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzdn
    final int zza() {
        return 24;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzdn
    final int[] zzb(int[] iArr, int i) {
        int length = iArr.length;
        if (length != 6) {
            throw new IllegalArgumentException(String.format("XChaCha20 uses 192-bit nonces, but got a %d-bit nonce", Integer.valueOf(length * 32)));
        }
        int[] iArr2 = new int[16];
        int[] iArr3 = new int[16];
        zzdj.zzb(iArr3, this.zza);
        iArr3[12] = iArr[0];
        iArr3[13] = iArr[1];
        iArr3[14] = iArr[2];
        iArr3[15] = iArr[3];
        zzdj.zzc(iArr3);
        iArr3[4] = iArr3[12];
        iArr3[5] = iArr3[13];
        iArr3[6] = iArr3[14];
        iArr3[7] = iArr3[15];
        zzdj.zzb(iArr2, Arrays.copyOf(iArr3, 8));
        iArr2[12] = i;
        iArr2[13] = 0;
        iArr2[14] = iArr[4];
        iArr2[15] = iArr[5];
        return iArr2;
    }
}
