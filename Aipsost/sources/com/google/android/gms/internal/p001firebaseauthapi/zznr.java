package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public enum zznr implements zzadh {
    UNKNOWN_KEYMATERIAL(0),
    SYMMETRIC(1),
    ASYMMETRIC_PRIVATE(2),
    ASYMMETRIC_PUBLIC(3),
    REMOTE(4),
    UNRECOGNIZED(-1);

    private static final zzadi zzg = new zzadi() { // from class: com.google.android.gms.internal.firebase-auth-api.zznq
    };
    private final int zzi;

    zznr(int i) {
        this.zzi = i;
    }

    public static zznr zzb(int i) {
        switch (i) {
            case 0:
                return UNKNOWN_KEYMATERIAL;
            case 1:
                return SYMMETRIC;
            case 2:
                return ASYMMETRIC_PRIVATE;
            case 3:
                return ASYMMETRIC_PUBLIC;
            case 4:
                return REMOTE;
            default:
                return null;
        }
    }

    @Override // java.lang.Enum
    public final String toString() {
        return Integer.toString(zza());
    }

    public final int zza() {
        if (this != UNRECOGNIZED) {
            return this.zzi;
        }
        throw new IllegalArgumentException("Can't get the number of an unknown enum value.");
    }
}
