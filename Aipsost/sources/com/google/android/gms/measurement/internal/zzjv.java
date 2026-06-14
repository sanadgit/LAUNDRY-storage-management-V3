package com.google.android.gms.measurement.internal;

import com.aipsoft.aipsoftconnect.utils.Constant;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjv {
    final /* synthetic */ zzjz zza;
    private zzju zzb;

    zzjv(zzjz zzjzVar) {
        this.zza = zzjzVar;
    }

    final void zza() {
        this.zza.zzg();
        if (this.zzb != null) {
            this.zza.zzd.removeCallbacks(this.zzb);
        }
        if (this.zza.zzs.zzc().zzn(null, zzea.zzar)) {
            this.zza.zzs.zzd().zzl.zzb(false);
        }
    }

    final void zzb(long j) {
        this.zzb = new zzju(this, this.zza.zzs.zzay().currentTimeMillis(), j);
        this.zza.zzd.postDelayed(this.zzb, Constant.FASTEST_LOCATION_INTERVAL);
    }
}
