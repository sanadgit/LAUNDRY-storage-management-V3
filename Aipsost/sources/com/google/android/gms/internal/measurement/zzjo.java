package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjo {
    private final Object zza;
    private final int zzb;

    zzjo(Object obj, int i) {
        this.zza = obj;
        this.zzb = i;
    }

    public final boolean equals(Object obj) {
        if (!(obj instanceof zzjo)) {
            return false;
        }
        zzjo zzjoVar = (zzjo) obj;
        return this.zza == zzjoVar.zza && this.zzb == zzjoVar.zzb;
    }

    public final int hashCode() {
        return (System.identityHashCode(this.zza) * 65535) + this.zzb;
    }
}
