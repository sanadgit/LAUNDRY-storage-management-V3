package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzxd {
    private String zza;
    private String zzb;

    private zzxd() {
    }

    public static zzxd zza(String str) {
        zzxd zzxdVar = new zzxd();
        zzxdVar.zza = str;
        return zzxdVar;
    }

    public static zzxd zzb(String str) {
        zzxd zzxdVar = new zzxd();
        zzxdVar.zzb = str;
        return zzxdVar;
    }

    public final String zzc() {
        return this.zza;
    }

    public final String zzd() {
        return this.zzb;
    }
}
