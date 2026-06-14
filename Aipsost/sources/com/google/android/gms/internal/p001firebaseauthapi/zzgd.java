package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final /* synthetic */ class zzgd {
    static final /* synthetic */ int[] zza;
    static final /* synthetic */ int[] zzb;

    static {
        int[] iArr = new int[zznr.values().length];
        zzb = iArr;
        try {
            iArr[zznr.SYMMETRIC.ordinal()] = 1;
        } catch (NoSuchFieldError e) {
        }
        try {
            zzb[zznr.ASYMMETRIC_PRIVATE.ordinal()] = 2;
        } catch (NoSuchFieldError e2) {
        }
        int[] iArr2 = new int[zzoy.values().length];
        zza = iArr2;
        try {
            iArr2[zzoy.TINK.ordinal()] = 1;
        } catch (NoSuchFieldError e3) {
        }
        try {
            zza[zzoy.LEGACY.ordinal()] = 2;
        } catch (NoSuchFieldError e4) {
        }
        try {
            zza[zzoy.RAW.ordinal()] = 3;
        } catch (NoSuchFieldError e5) {
        }
        try {
            zza[zzoy.CRUNCHY.ordinal()] = 4;
        } catch (NoSuchFieldError e6) {
        }
    }
}
