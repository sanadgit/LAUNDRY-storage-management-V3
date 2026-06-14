package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhf {
    private final Class zza;
    private final Class zzb;

    /* synthetic */ zzhf(Class cls, Class cls2, zzhe zzheVar) {
        this.zza = cls;
        this.zzb = cls2;
    }

    public final boolean equals(Object obj) {
        if (!(obj instanceof zzhf)) {
            return false;
        }
        zzhf zzhfVar = (zzhf) obj;
        return zzhfVar.zza.equals(this.zza) && zzhfVar.zzb.equals(this.zzb);
    }

    public final int hashCode() {
        return Arrays.hashCode(new Object[]{this.zza, this.zzb});
    }

    public final String toString() {
        return this.zza.getSimpleName() + " with serialization type: " + this.zzb.getSimpleName();
    }
}
