package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class zzxi {
    final String zza;
    final zzxq zzb;

    public zzxi(String str, zzxq zzxqVar) {
        this.zza = str;
        this.zzb = zzxqVar;
    }

    final String zza(String str, String str2) {
        return this.zza + str + "?key=" + str2;
    }
}
