package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.InvalidKeyException;
import java.util.Arrays;
import java.util.Collection;
import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import kotlin.jvm.internal.ByteCompanionObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzpo implements zzat {
    private static final Collection zza = Arrays.asList(64);
    private static final byte[] zzb = new byte[16];
    private final zzql zzc;
    private final byte[] zzd;

    public zzpo(byte[] bArr) throws GeneralSecurityException {
        if (!zzdv.zza(1)) {
            throw new GeneralSecurityException("Can not use AES-SIV in FIPS-mode.");
        }
        Collection collection = zza;
        int length = bArr.length;
        if (collection.contains(Integer.valueOf(length))) {
            int i = length >> 1;
            byte[] bArrCopyOfRange = Arrays.copyOfRange(bArr, 0, i);
            this.zzd = Arrays.copyOfRange(bArr, i, length);
            this.zzc = new zzql(bArrCopyOfRange);
            return;
        }
        throw new InvalidKeyException("invalid key size: " + length + " bytes; key must have 64 bytes");
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzat
    public final byte[] zza(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        byte[] bArrZzd;
        int length = bArr.length;
        if (length < 16) {
            throw new GeneralSecurityException("Ciphertext too short.");
        }
        Cipher cipher = (Cipher) zzpz.zza.zza("AES/CTR/NoPadding");
        byte[] bArrCopyOfRange = Arrays.copyOfRange(bArr, 0, 16);
        byte[] bArr3 = (byte[]) bArrCopyOfRange.clone();
        bArr3[8] = (byte) (bArr3[8] & ByteCompanionObject.MAX_VALUE);
        bArr3[12] = (byte) (bArr3[12] & ByteCompanionObject.MAX_VALUE);
        cipher.init(2, new SecretKeySpec(this.zzd, "AES"), new IvParameterSpec(bArr3));
        byte[] bArrCopyOfRange2 = Arrays.copyOfRange(bArr, 16, length);
        byte[] bArrDoFinal = cipher.doFinal(bArrCopyOfRange2);
        if (bArrCopyOfRange2.length == 0 && bArrDoFinal == null && zzqr.zza()) {
            bArrDoFinal = new byte[0];
        }
        byte[][] bArr4 = {bArr2, bArrDoFinal};
        byte[] bArrZza = this.zzc.zza(zzb, 16);
        for (int i = 0; i <= 0; i++) {
            byte[] bArr5 = bArr4[i];
            if (bArr5 == null) {
                bArr5 = new byte[0];
            }
            bArrZza = zzpp.zzd(zziz.zzb(bArrZza), this.zzc.zza(bArr5, 16));
        }
        byte[] bArr6 = bArr4[1];
        int length2 = bArr6.length;
        if (length2 >= 16) {
            int length3 = bArrZza.length;
            if (length2 < length3) {
                throw new IllegalArgumentException("xorEnd requires a.length >= b.length");
            }
            int i2 = length2 - length3;
            bArrZzd = Arrays.copyOf(bArr6, length2);
            for (int i3 = 0; i3 < bArrZza.length; i3++) {
                int i4 = i2 + i3;
                bArrZzd[i4] = (byte) (bArrZzd[i4] ^ bArrZza[i3]);
            }
        } else {
            bArrZzd = zzpp.zzd(zziz.zza(bArr6), zziz.zzb(bArrZza));
        }
        if (zzpp.zzb(bArrCopyOfRange, this.zzc.zza(bArrZzd, 16))) {
            return bArrDoFinal;
        }
        throw new AEADBadTagException("Integrity check failed.");
    }
}
