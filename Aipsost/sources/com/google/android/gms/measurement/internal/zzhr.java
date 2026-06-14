package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhr implements Runnable {
    final /* synthetic */ zzaf zza;
    final /* synthetic */ long zzb;
    final /* synthetic */ int zzc;
    final /* synthetic */ long zzd;
    final /* synthetic */ boolean zze;
    final /* synthetic */ zzhw zzf;

    zzhr(zzhw zzhwVar, zzaf zzafVar, long j, int i, long j2, boolean z) {
        this.zzf = zzhwVar;
        this.zza = zzafVar;
        this.zzb = j;
        this.zzc = i;
        this.zzd = j2;
        this.zze = z;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzf.zzr(this.zza);
        this.zzf.zzG(this.zzb, false);
        zzhw.zzW(this.zzf, this.zza, this.zzc, this.zzd, true, this.zze);
    }
}
