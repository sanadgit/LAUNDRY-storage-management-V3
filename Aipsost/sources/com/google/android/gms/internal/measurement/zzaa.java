package com.google.android.gms.internal.measurement;

import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaa {
    private String zza;
    private final long zzb;
    private final Map<String, Object> zzc;

    public zzaa(String str, long j, Map<String, Object> map) {
        this.zza = str;
        this.zzb = j;
        HashMap map2 = new HashMap();
        this.zzc = map2;
        if (map != null) {
            map2.putAll(map);
        }
    }

    public final boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof zzaa)) {
            return false;
        }
        zzaa zzaaVar = (zzaa) obj;
        if (this.zzb == zzaaVar.zzb && this.zza.equals(zzaaVar.zza)) {
            return this.zzc.equals(zzaaVar.zzc);
        }
        return false;
    }

    public final int hashCode() {
        int iHashCode = this.zza.hashCode();
        long j = this.zzb;
        return (((iHashCode * 31) + ((int) (j ^ (j >>> 32)))) * 31) + this.zzc.hashCode();
    }

    public final String toString() {
        String str = this.zza;
        long j = this.zzb;
        String strValueOf = String.valueOf(this.zzc);
        StringBuilder sb = new StringBuilder(String.valueOf(str).length() + 55 + String.valueOf(strValueOf).length());
        sb.append("Event{name='");
        sb.append(str);
        sb.append("', timestamp=");
        sb.append(j);
        sb.append(", params=");
        sb.append(strValueOf);
        sb.append('}');
        return sb.toString();
    }

    public final long zza() {
        return this.zzb;
    }

    public final String zzb() {
        return this.zza;
    }

    public final void zzc(String str) {
        this.zza = str;
    }

    public final void zzd(String str, Object obj) {
        if (obj == null) {
            this.zzc.remove(str);
        } else {
            this.zzc.put(str, obj);
        }
    }

    public final Object zze(String str) {
        if (this.zzc.containsKey(str)) {
            return this.zzc.get(str);
        }
        return null;
    }

    public final Map<String, Object> zzf() {
        return this.zzc;
    }

    /* JADX INFO: renamed from: zzg, reason: merged with bridge method [inline-methods] */
    public final zzaa clone() {
        return new zzaa(this.zza, this.zzb, new HashMap(this.zzc));
    }
}
