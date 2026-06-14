package com.google.android.gms.internal.p001firebaseauthapi;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzff {
    public static final byte[] zza = zzc(1, 0);
    public static final byte[] zzb = zzc(2, 32);
    public static final byte[] zzc = zzc(2, 16);
    public static final byte[] zzd = zzc(2, 17);
    public static final byte[] zze = zzc(2, 18);
    public static final byte[] zzf = zzc(2, 1);
    public static final byte[] zzg = zzc(2, 2);
    public static final byte[] zzh = zzc(2, 3);
    public static final byte[] zzi = zzc(2, 1);
    public static final byte[] zzj = zzc(2, 2);
    public static final byte[] zzk = zzc(2, 3);
    public static final byte[] zzl = new byte[0];
    private static final byte[] zzm = "KEM".getBytes(StandardCharsets.UTF_8);
    private static final byte[] zzn = "HPKE".getBytes(StandardCharsets.UTF_8);
    private static final byte[] zzo = "HPKE-v1".getBytes(StandardCharsets.UTF_8);

    static void zza(zznh zznhVar) throws GeneralSecurityException {
        if (zznhVar.zzf() == 2 || zznhVar.zzf() == 1) {
            throw new GeneralSecurityException("Invalid KEM param: ".concat(zznb.zza(zznhVar.zzf())));
        }
        String str = "UNRECOGNIZED";
        if (zznhVar.zze() == 2 || zznhVar.zze() == 1) {
            switch (zznhVar.zze()) {
                case 2:
                    str = "KDF_UNKNOWN";
                    break;
                case 3:
                    str = "HKDF_SHA256";
                    break;
                case 4:
                    str = "HKDF_SHA384";
                    break;
                case 5:
                    str = "HKDF_SHA512";
                    break;
            }
            throw new GeneralSecurityException("Invalid KDF param: ".concat(str));
        }
        if (zznhVar.zzd() == 2 || zznhVar.zzd() == 1) {
            switch (zznhVar.zzd()) {
                case 2:
                    str = "AEAD_UNKNOWN";
                    break;
                case 3:
                    str = "AES_128_GCM";
                    break;
                case 4:
                    str = "AES_256_GCM";
                    break;
                case 5:
                    str = "CHACHA20_POLY1305";
                    break;
            }
            throw new GeneralSecurityException("Invalid AEAD param: ".concat(str));
        }
    }

    static byte[] zzb(byte[] bArr, byte[] bArr2, byte[] bArr3) throws GeneralSecurityException {
        return zzpp.zzc(zzn, bArr, bArr2, bArr3);
    }

    public static byte[] zzc(int i, int i2) {
        byte[] bArr = new byte[i];
        for (int i3 = 0; i3 < i; i3++) {
            bArr[i3] = (byte) ((i2 >> (((i - i3) - 1) * 8)) & 255);
        }
        return bArr;
    }

    static byte[] zzd(byte[] bArr) throws GeneralSecurityException {
        return zzpp.zzc(zzm, bArr);
    }

    static byte[] zze(String str, byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        return zzpp.zzc(zzo, bArr2, str.getBytes(StandardCharsets.UTF_8), bArr);
    }

    static byte[] zzf(String str, byte[] bArr, byte[] bArr2, int i) throws GeneralSecurityException {
        return zzpp.zzc(zzc(2, i), zzo, bArr2, str.getBytes(StandardCharsets.UTF_8), bArr);
    }

    static int zzg(int i) throws GeneralSecurityException {
        switch (i - 2) {
            case 2:
                return 1;
            case 3:
                return 2;
            case 4:
                return 3;
            default:
                throw new GeneralSecurityException("Unrecognized NIST HPKE KEM identifier");
        }
    }
}
