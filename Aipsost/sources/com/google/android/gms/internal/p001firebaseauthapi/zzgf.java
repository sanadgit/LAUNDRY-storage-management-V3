package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgf extends zzbn {
    private final String zza;
    private final zzoy zzb;

    /* synthetic */ zzgf(String str, zzoy zzoyVar, zzge zzgeVar) {
        this.zza = str;
        this.zzb = zzoyVar;
    }

    public final String toString() {
        String str;
        Object[] objArr = new Object[2];
        objArr[0] = this.zza;
        zzoy zzoyVar = this.zzb;
        zznr zznrVar = zznr.UNKNOWN_KEYMATERIAL;
        zzoy zzoyVar2 = zzoy.UNKNOWN_PREFIX;
        switch (zzoyVar.ordinal()) {
            case 1:
                str = "TINK";
                break;
            case 2:
                str = "LEGACY";
                break;
            case 3:
                str = "RAW";
                break;
            case 4:
                str = "CRUNCHY";
                break;
            default:
                str = "UNKNOWN";
                break;
        }
        objArr[1] = str;
        return String.format("(typeUrl=%s, outputPrefixType=%s)", objArr);
    }
}
