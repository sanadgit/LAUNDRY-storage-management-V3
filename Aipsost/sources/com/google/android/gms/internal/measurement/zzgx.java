package com.google.android.gms.internal.measurement;

import android.content.Context;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgx extends zzhs {
    private final Context zza;
    private final zzib<zzhz<zzhi>> zzb;

    zzgx(Context context, @Nullable zzib<zzhz<zzhi>> zzibVar) {
        if (context == null) {
            throw new NullPointerException("Null context");
        }
        this.zza = context;
        this.zzb = zzibVar;
    }

    public final boolean equals(Object obj) {
        zzib<zzhz<zzhi>> zzibVar;
        if (obj == this) {
            return true;
        }
        if (obj instanceof zzhs) {
            zzhs zzhsVar = (zzhs) obj;
            if (this.zza.equals(zzhsVar.zza()) && ((zzibVar = this.zzb) != null ? zzibVar.equals(zzhsVar.zzb()) : zzhsVar.zzb() == null)) {
                return true;
            }
        }
        return false;
    }

    public final int hashCode() {
        int iHashCode = (this.zza.hashCode() ^ 1000003) * 1000003;
        zzib<zzhz<zzhi>> zzibVar = this.zzb;
        return iHashCode ^ (zzibVar == null ? 0 : zzibVar.hashCode());
    }

    public final String toString() {
        String strValueOf = String.valueOf(this.zza);
        String strValueOf2 = String.valueOf(this.zzb);
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 46 + String.valueOf(strValueOf2).length());
        sb.append("FlagsContext{context=");
        sb.append(strValueOf);
        sb.append(", hermeticFileOverrides=");
        sb.append(strValueOf2);
        sb.append("}");
        return sb.toString();
    }

    @Override // com.google.android.gms.internal.measurement.zzhs
    final Context zza() {
        return this.zza;
    }

    @Override // com.google.android.gms.internal.measurement.zzhs
    @Nullable
    final zzib<zzhz<zzhi>> zzb() {
        return this.zzb;
    }
}
