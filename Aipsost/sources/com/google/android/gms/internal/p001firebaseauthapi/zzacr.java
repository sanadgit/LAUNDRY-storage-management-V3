package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzacr {
    private final Object zza;
    private final int zzb;

    zzacr(Object obj, int i) {
        this.zza = obj;
        this.zzb = i;
    }

    public final boolean equals(Object obj) {
        if (!(obj instanceof zzacr)) {
            return false;
        }
        zzacr zzacrVar = (zzacr) obj;
        return this.zza == zzacrVar.zza && this.zzb == zzacrVar.zzb;
    }

    public final int hashCode() {
        return (System.identityHashCode(this.zza) * 65535) + this.zzb;
    }
}
