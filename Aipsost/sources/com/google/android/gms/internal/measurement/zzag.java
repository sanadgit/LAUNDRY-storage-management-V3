package com.google.android.gms.internal.measurement;

import java.util.Iterator;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzag implements zzap {
    private final zzap zza;
    private final String zzb;

    public zzag() {
        zzap zzapVar = zzf;
        throw null;
    }

    public zzag(String str) {
        this.zza = zzf;
        this.zzb = str;
    }

    public zzag(String str, zzap zzapVar) {
        this.zza = zzapVar;
        this.zzb = str;
    }

    public final boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }
        if (!(obj instanceof zzag)) {
            return false;
        }
        zzag zzagVar = (zzag) obj;
        return this.zzb.equals(zzagVar.zzb) && this.zza.equals(zzagVar.zza);
    }

    public final int hashCode() {
        return (this.zzb.hashCode() * 31) + this.zza.hashCode();
    }

    public final zzap zzb() {
        return this.zza;
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final zzap zzbK(String str, zzg zzgVar, List<zzap> list) {
        throw new IllegalStateException("Control does not have functions");
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final String zzc() {
        throw new IllegalStateException("Control is not a String");
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Double zzd() {
        throw new IllegalStateException("Control is not a double");
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Boolean zze() {
        throw new IllegalStateException("Control is not a boolean");
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Iterator<zzap> zzf() {
        return null;
    }

    public final String zzg() {
        return this.zzb;
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final zzap zzt() {
        return new zzag(this.zzb, this.zza.zzt());
    }
}
