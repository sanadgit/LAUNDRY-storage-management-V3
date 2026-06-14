package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zznb {
    private static final zzadi zza = new zzna();

    public static /* synthetic */ String zza(int i) {
        switch (i) {
            case 2:
                return "KEM_UNKNOWN";
            case 3:
                return "DHKEM_X25519_HKDF_SHA256";
            case 4:
                return "DHKEM_P256_HKDF_SHA256";
            case 5:
                return "DHKEM_P384_HKDF_SHA384";
            case 6:
                return "DHKEM_P521_HKDF_SHA512";
            default:
                return "UNRECOGNIZED";
        }
    }
}
