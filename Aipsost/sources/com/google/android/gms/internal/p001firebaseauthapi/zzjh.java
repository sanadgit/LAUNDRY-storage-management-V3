package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjh {
    private final zzbe zza;
    private final int zzb;
    private final zzbn zzc;

    /* synthetic */ zzjh(zzbe zzbeVar, int i, zzbn zzbnVar, zzjg zzjgVar) {
        this.zza = zzbeVar;
        this.zzb = i;
        this.zzc = zzbnVar;
    }

    public final boolean equals(Object obj) {
        if (!(obj instanceof zzjh)) {
            return false;
        }
        zzjh zzjhVar = (zzjh) obj;
        return this.zza == zzjhVar.zza && this.zzb == zzjhVar.zzb && this.zzc.equals(zzjhVar.zzc);
    }

    public final int hashCode() {
        return Arrays.hashCode(new Object[]{this.zza, Integer.valueOf(this.zzb), Integer.valueOf(this.zzc.hashCode())});
    }

    public final String toString() {
        return String.format("(status=%s, keyId=%s, parameters='%s')", this.zza, Integer.valueOf(this.zzb), this.zzc);
    }

    public final int zza() {
        return this.zzb;
    }
}
