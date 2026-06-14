package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzeo {
    public static void zza(zzma zzmaVar) throws GeneralSecurityException {
        zzpx.zzl(zzc(zzmaVar.zze().zzf()));
        zzb(zzmaVar.zze().zzg());
        if (zzmaVar.zzh() == 2) {
            throw new GeneralSecurityException("unknown EC point format");
        }
        zzbz.zzc(zzmaVar.zza().zzd());
    }

    public static String zzb(int i) throws NoSuchAlgorithmException {
        switch (i - 2) {
            case 1:
                return "HmacSha1";
            case 2:
                return "HmacSha384";
            case 3:
                return "HmacSha256";
            case 4:
                return "HmacSha512";
            case 5:
                return "HmacSha224";
            default:
                throw new NoSuchAlgorithmException("hash unsupported for HMAC: ".concat(Integer.toString(zzmq.zza(i))));
        }
    }

    public static int zzc(int i) throws GeneralSecurityException {
        switch (i - 2) {
            case 2:
                return 1;
            case 3:
                return 2;
            case 4:
                return 3;
            default:
                throw new GeneralSecurityException("unknown curve type: ".concat(Integer.toString(zzml.zza(i))));
        }
    }

    public static int zzd(int i) throws GeneralSecurityException {
        switch (i - 2) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 3:
                return 3;
            default:
                throw new GeneralSecurityException("unknown point format: ".concat(Integer.toString(zzlr.zza(i))));
        }
    }
}
