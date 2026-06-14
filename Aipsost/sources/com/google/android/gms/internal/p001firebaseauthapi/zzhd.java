package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhd {
    private final Class zza;
    private final zzqv zzb;

    /* synthetic */ zzhd(Class cls, zzqv zzqvVar, zzhc zzhcVar) {
        this.zza = cls;
        this.zzb = zzqvVar;
    }

    public final boolean equals(Object obj) {
        if (!(obj instanceof zzhd)) {
            return false;
        }
        zzhd zzhdVar = (zzhd) obj;
        return zzhdVar.zza.equals(this.zza) && zzhdVar.zzb.equals(this.zzb);
    }

    public final int hashCode() {
        return Arrays.hashCode(new Object[]{this.zza, this.zzb});
    }

    public final String toString() {
        return this.zza.getSimpleName() + ", object identifier: " + String.valueOf(this.zzb);
    }
}
