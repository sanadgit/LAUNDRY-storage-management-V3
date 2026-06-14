package com.google.android.gms.measurement.internal;

import android.os.Handler;
import android.os.Looper;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjz extends zzf {
    protected final zzjy zza;
    protected final zzjx zzb;
    protected final zzjv zzc;
    private Handler zzd;

    zzjz(zzfu zzfuVar) {
        super(zzfuVar);
        this.zza = new zzjy(this);
        this.zzb = new zzjx(this);
        this.zzc = new zzjv(this);
    }

    static /* synthetic */ void zzh(zzjz zzjzVar, long j) {
        zzjzVar.zzg();
        zzjzVar.zzl();
        zzjzVar.zzs.zzau().zzk().zzb("Activity resumed, time", Long.valueOf(j));
        if (zzjzVar.zzs.zzc().zzn(null, zzea.zzar)) {
            if (zzjzVar.zzs.zzc().zzt() || zzjzVar.zzs.zzd().zzl.zza()) {
                zzjzVar.zzb.zza(j);
            }
            zzjzVar.zzc.zza();
        } else {
            zzjzVar.zzc.zza();
            if (zzjzVar.zzs.zzc().zzt()) {
                zzjzVar.zzb.zza(j);
            }
        }
        zzjy zzjyVar = zzjzVar.zza;
        zzjyVar.zza.zzg();
        if (zzjyVar.zza.zzs.zzF()) {
            if (!zzjyVar.zza.zzs.zzc().zzn(null, zzea.zzar)) {
                zzjyVar.zza.zzs.zzd().zzl.zzb(false);
            }
            zzjyVar.zzb(zzjyVar.zza.zzs.zzay().currentTimeMillis(), false);
        }
    }

    static /* synthetic */ void zzi(zzjz zzjzVar, long j) {
        zzjzVar.zzg();
        zzjzVar.zzl();
        zzjzVar.zzs.zzau().zzk().zzb("Activity paused, time", Long.valueOf(j));
        zzjzVar.zzc.zzb(j);
        if (zzjzVar.zzs.zzc().zzt()) {
            zzjzVar.zzb.zzb(j);
        }
        zzjy zzjyVar = zzjzVar.zza;
        if (zzjyVar.zza.zzs.zzc().zzn(null, zzea.zzar)) {
            return;
        }
        zzjyVar.zza.zzs.zzd().zzl.zzb(true);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzl() {
        zzg();
        if (this.zzd == null) {
            this.zzd = new com.google.android.gms.internal.measurement.zzby(Looper.getMainLooper());
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzf
    protected final boolean zze() {
        return false;
    }
}
