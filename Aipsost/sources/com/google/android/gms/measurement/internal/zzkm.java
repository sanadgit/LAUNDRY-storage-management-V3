package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;
import java.util.ArrayList;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzkm {
    com.google.android.gms.internal.measurement.zzfw zza;
    List<Long> zzb;
    List<com.google.android.gms.internal.measurement.zzfo> zzc;
    long zzd;
    final /* synthetic */ zzkn zze;

    /* synthetic */ zzkm(zzkn zzknVar, zzkg zzkgVar) {
        this.zze = zzknVar;
    }

    private static final long zzb(com.google.android.gms.internal.measurement.zzfo zzfoVar) {
        return ((zzfoVar.zzf() / 1000) / 60) / 60;
    }

    public final boolean zza(long j, com.google.android.gms.internal.measurement.zzfo zzfoVar) {
        Preconditions.checkNotNull(zzfoVar);
        if (this.zzc == null) {
            this.zzc = new ArrayList();
        }
        if (this.zzb == null) {
            this.zzb = new ArrayList();
        }
        if (this.zzc.size() > 0 && zzb(this.zzc.get(0)) != zzb(zzfoVar)) {
            return false;
        }
        long jZzbw = this.zzd + ((long) zzfoVar.zzbw());
        this.zze.zzd();
        if (jZzbw >= Math.max(0, zzea.zzh.zzb(null).intValue())) {
            return false;
        }
        this.zzd = jZzbw;
        this.zzc.add(zzfoVar);
        this.zzb.add(Long.valueOf(j));
        int size = this.zzc.size();
        this.zze.zzd();
        return size < Math.max(1, zzea.zzi.zzb(null).intValue());
    }
}
