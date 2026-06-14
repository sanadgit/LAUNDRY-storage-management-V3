package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import com.google.android.gms.internal.measurement.zzom;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjx {
    protected long zza;
    protected long zzb;
    final /* synthetic */ zzjz zzc;
    private final zzal zzd;

    public zzjx(zzjz zzjzVar) {
        this.zzc = zzjzVar;
        this.zzd = new zzjw(this, zzjzVar.zzs);
        long jElapsedRealtime = zzjzVar.zzs.zzay().elapsedRealtime();
        this.zza = jElapsedRealtime;
        this.zzb = jElapsedRealtime;
    }

    final void zza(long j) {
        this.zzc.zzg();
        this.zzd.zzd();
        this.zza = j;
        this.zzb = j;
    }

    final void zzb(long j) {
        this.zzd.zzd();
    }

    final void zzc() {
        this.zzd.zzd();
        this.zza = 0L;
        this.zzb = 0L;
    }

    public final boolean zzd(boolean z, boolean z2, long j) {
        this.zzc.zzg();
        this.zzc.zzb();
        zzom.zzb();
        if (!this.zzc.zzs.zzc().zzn(null, zzea.zzan) || this.zzc.zzs.zzF()) {
            this.zzc.zzs.zzd().zzj.zzb(this.zzc.zzs.zzay().currentTimeMillis());
        }
        long j2 = j - this.zza;
        if (!z && j2 < 1000) {
            this.zzc.zzs.zzau().zzk().zzb("Screen exposed for less than 1000 ms. Event not sent. time", Long.valueOf(j2));
            return false;
        }
        if (!z2) {
            j2 = j - this.zzb;
            this.zzb = j;
        }
        this.zzc.zzs.zzau().zzk().zzb("Recording user engagement, ms", Long.valueOf(j2));
        Bundle bundle = new Bundle();
        bundle.putLong("_et", j2);
        zzik.zzm(this.zzc.zzs.zzx().zzh(!this.zzc.zzs.zzc().zzt()), bundle, true);
        if (!this.zzc.zzs.zzc().zzn(null, zzea.zzT) && z2) {
            bundle.putLong("_fr", 1L);
        }
        if (!this.zzc.zzs.zzc().zzn(null, zzea.zzT) || !z2) {
            this.zzc.zzs.zzk().zzs(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_e", bundle);
        }
        this.zza = j;
        this.zzd.zzd();
        this.zzd.zzb(3600000L);
        return true;
    }
}
