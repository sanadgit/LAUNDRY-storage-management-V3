package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzju implements Runnable {
    final long zza;
    final long zzb;
    final /* synthetic */ zzjv zzc;

    zzju(zzjv zzjvVar, long j, long j2) {
        this.zzc = zzjvVar;
        this.zza = j;
        this.zzb = j2;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zzc.zza.zzs.zzav().zzh(new Runnable(this) { // from class: com.google.android.gms.measurement.internal.zzjt
            private final zzju zza;

            {
                this.zza = this;
            }

            @Override // java.lang.Runnable
            public final void run() {
                zzju zzjuVar = this.zza;
                zzjv zzjvVar = zzjuVar.zzc;
                long j = zzjuVar.zza;
                long j2 = zzjuVar.zzb;
                zzjvVar.zza.zzg();
                zzjvVar.zza.zzs.zzau().zzj().zza("Application going to the background");
                boolean z = true;
                if (zzjvVar.zza.zzs.zzc().zzn(null, zzea.zzar)) {
                    zzjvVar.zza.zzs.zzd().zzl.zzb(true);
                }
                Bundle bundle = new Bundle();
                if (!zzjvVar.zza.zzs.zzc().zzt()) {
                    zzjvVar.zza.zzb.zzb(j2);
                    if (zzjvVar.zza.zzs.zzc().zzn(null, zzea.zzaj)) {
                        zzjx zzjxVar = zzjvVar.zza.zzb;
                        long j3 = zzjxVar.zzb;
                        zzjxVar.zzb = j2;
                        bundle.putLong("_et", j2 - j3);
                        zzik.zzm(zzjvVar.zza.zzs.zzx().zzh(true), bundle, true);
                    } else {
                        z = false;
                    }
                    zzjvVar.zza.zzb.zzd(false, z, j2);
                }
                zzjvVar.zza.zzs.zzk().zzt(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_ab", j, bundle);
            }
        });
    }
}
