package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zziz implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ boolean zzb;
    final /* synthetic */ zzas zzc;
    final /* synthetic */ String zzd;
    final /* synthetic */ zzjk zze;

    zziz(zzjk zzjkVar, boolean z, zzp zzpVar, boolean z2, zzas zzasVar, String str) {
        this.zze = zzjkVar;
        this.zza = zzpVar;
        this.zzb = z2;
        this.zzc = zzasVar;
        this.zzd = str;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzed zzedVar = this.zze.zzb;
        if (zzedVar == null) {
            this.zze.zzs.zzau().zzb().zza("Discarding data. Failed to send event to service");
            return;
        }
        Preconditions.checkNotNull(this.zza);
        this.zze.zzk(zzedVar, this.zzb ? null : this.zzc, this.zza);
        this.zze.zzP();
    }
}
