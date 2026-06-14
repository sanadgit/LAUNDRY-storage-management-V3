package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgl implements Runnable {
    final /* synthetic */ String zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ String zzc;
    final /* synthetic */ long zzd;
    final /* synthetic */ zzgm zze;

    zzgl(zzgm zzgmVar, String str, String str2, String str3, long j) {
        this.zze = zzgmVar;
        this.zza = str;
        this.zzb = str2;
        this.zzc = str3;
        this.zzd = j;
    }

    @Override // java.lang.Runnable
    public final void run() {
        String str = this.zza;
        if (str == null) {
            this.zze.zza.zzN().zzx().zzn(this.zzb, null);
        } else {
            this.zze.zza.zzN().zzx().zzn(this.zzb, new zzid(this.zzc, str, this.zzd));
        }
    }
}
