package com.google.android.gms.internal.p001firebaseauthapi;

import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzeu {
    private static final byte[] zza = new byte[0];
    private final zzet zzb;
    private final BigInteger zzc;
    private final byte[] zzd;
    private final byte[] zze;
    private final byte[] zzf;
    private BigInteger zzg = BigInteger.ZERO;

    private zzeu(byte[] bArr, byte[] bArr2, byte[] bArr3, BigInteger bigInteger, zzet zzetVar) {
        this.zzf = bArr;
        this.zzd = bArr2;
        this.zze = bArr3;
        this.zzc = bigInteger;
        this.zzb = zzetVar;
    }

    static zzeu zzb(byte[] bArr, byte[] bArr2, zzex zzexVar, zzes zzesVar, zzet zzetVar, byte[] bArr3) throws GeneralSecurityException {
        byte[] bArrZzb = zzff.zzb(zzexVar.zzb(), zzesVar.zzc(), zzetVar.zzb());
        byte[] bArr4 = zzff.zzl;
        byte[] bArr5 = zza;
        byte[] bArrZzc = zzpp.zzc(zzff.zza, zzesVar.zze(bArr4, bArr5, "psk_id_hash", bArrZzb), zzesVar.zze(zzff.zzl, bArr3, "info_hash", bArrZzb));
        byte[] bArrZze = zzesVar.zze(bArr2, bArr5, "secret", bArrZzb);
        return new zzeu(bArr, zzesVar.zzd(bArrZze, bArrZzc, "key", bArrZzb, zzetVar.zza()), zzesVar.zzd(bArrZze, bArrZzc, "base_nonce", bArrZzb, 12), BigInteger.ONE.shiftLeft(96).subtract(BigInteger.ONE), zzetVar);
    }

    private final synchronized byte[] zzc() throws GeneralSecurityException {
        byte[] bArrZzd;
        byte[] bArr = this.zze;
        byte[] byteArray = this.zzg.toByteArray();
        int length = byteArray.length;
        if (length != 12) {
            if (length > 13) {
                throw new GeneralSecurityException("integer too large");
            }
            if (length != 13) {
                byte[] bArr2 = new byte[12];
                System.arraycopy(byteArray, 0, bArr2, 12 - length, length);
                byteArray = bArr2;
            } else {
                if (byteArray[0] != 0) {
                    throw new GeneralSecurityException("integer too large");
                }
                byteArray = Arrays.copyOfRange(byteArray, 1, 13);
            }
        }
        bArrZzd = zzpp.zzd(bArr, byteArray);
        if (this.zzg.compareTo(this.zzc) >= 0) {
            throw new GeneralSecurityException("message limit reached");
        }
        this.zzg = this.zzg.add(BigInteger.ONE);
        return bArrZzd;
    }

    final byte[] zza(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        return this.zzb.zzc(this.zzd, zzc(), bArr, bArr2);
    }
}
