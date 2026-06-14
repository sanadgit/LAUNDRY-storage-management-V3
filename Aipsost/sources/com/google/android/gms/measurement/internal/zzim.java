package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzim implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ boolean zzb;
    final /* synthetic */ zzkq zzc;
    final /* synthetic */ zzjk zzd;

    zzim(zzjk zzjkVar, zzp zzpVar, boolean z, zzkq zzkqVar) {
        this.zzd = zzjkVar;
        this.zza = zzpVar;
        this.zzb = z;
        this.zzc = zzkqVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzed zzedVar = this.zzd.zzb;
        if (zzedVar == null) {
            this.zzd.zzs.zzau().zzb().zza("Discarding data. Failed to set user property");
            return;
        }
        Preconditions.checkNotNull(this.zza);
        this.zzd.zzk(zzedVar, this.zzb ? null : this.zzc, this.zza);
        this.zzd.zzP();
    }
}
