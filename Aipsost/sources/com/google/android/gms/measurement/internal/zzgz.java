package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgz implements Runnable {
    final /* synthetic */ boolean zza;
    final /* synthetic */ zzhw zzb;

    zzgz(zzhw zzhwVar, boolean z) {
        this.zzb = zzhwVar;
        this.zza = z;
    }

    @Override // java.lang.Runnable
    public final void run() {
        boolean zZzF = this.zzb.zzs.zzF();
        boolean zZzE = this.zzb.zzs.zzE();
        this.zzb.zzs.zzD(this.zza);
        if (zZzE == this.zza) {
            this.zzb.zzs.zzau().zzk().zzb("Default data collection state already set to", Boolean.valueOf(this.zza));
        }
        if (this.zzb.zzs.zzF() == zZzF || this.zzb.zzs.zzF() != this.zzb.zzs.zzE()) {
            this.zzb.zzs.zzau().zzh().zzc("Default data collection is different than actual status", Boolean.valueOf(this.zza), Boolean.valueOf(zZzF));
        }
        this.zzb.zzZ();
    }
}
