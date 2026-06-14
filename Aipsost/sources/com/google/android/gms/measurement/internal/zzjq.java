package com.google.android.gms.measurement.internal;

import android.app.job.JobParameters;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.measurement.internal.zzjp;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjq<T extends Context & zzjp> {
    private final T zza;

    public zzjq(T t) {
        Preconditions.checkNotNull(t);
        this.zza = t;
    }

    private final zzem zzk() {
        return zzfu.zzC(this.zza, null, null).zzau();
    }

    public final void zza() {
        zzfu zzfuVarZzC = zzfu.zzC(this.zza, null, null);
        zzem zzemVarZzau = zzfuVarZzC.zzau();
        zzfuVarZzC.zzat();
        zzemVarZzau.zzk().zza("Local AppMeasurementService is starting up");
    }

    public final void zzb() {
        zzfu zzfuVarZzC = zzfu.zzC(this.zza, null, null);
        zzem zzemVarZzau = zzfuVarZzC.zzau();
        zzfuVarZzC.zzat();
        zzemVarZzau.zzk().zza("Local AppMeasurementService is shutting down");
    }

    public final int zzc(final Intent intent, int i, final int i2) {
        zzfu zzfuVarZzC = zzfu.zzC(this.zza, null, null);
        final zzem zzemVarZzau = zzfuVarZzC.zzau();
        if (intent == null) {
            zzemVarZzau.zze().zza("AppMeasurementService started with null intent");
            return 2;
        }
        String action = intent.getAction();
        zzfuVarZzC.zzat();
        zzemVarZzau.zzk().zzc("Local AppMeasurementService called. startId, action", Integer.valueOf(i2), action);
        if ("com.google.android.gms.measurement.UPLOAD".equals(action)) {
            zzd(new Runnable(this, i2, zzemVarZzau, intent) { // from class: com.google.android.gms.measurement.internal.zzjm
                private final zzjq zza;
                private final int zzb;
                private final zzem zzc;
                private final Intent zzd;

                {
                    this.zza = this;
                    this.zzb = i2;
                    this.zzc = zzemVarZzau;
                    this.zzd = intent;
                }

                @Override // java.lang.Runnable
                public final void run() {
                    this.zza.zzj(this.zzb, this.zzc, this.zzd);
                }
            });
        }
        return 2;
    }

    public final void zzd(Runnable runnable) {
        zzkn zzknVarZza = zzkn.zza(this.zza);
        zzknVarZza.zzav().zzh(new zzjo(this, zzknVarZza, runnable));
    }

    public final IBinder zze(Intent intent) {
        if (intent == null) {
            zzk().zzb().zza("onBind called with null intent");
            return null;
        }
        String action = intent.getAction();
        if ("com.google.android.gms.measurement.START".equals(action)) {
            return new zzgm(zzkn.zza(this.zza), null);
        }
        zzk().zze().zzb("onBind received unknown action", action);
        return null;
    }

    public final boolean zzf(Intent intent) {
        if (intent == null) {
            zzk().zzb().zza("onUnbind called with null intent");
            return true;
        }
        zzk().zzk().zzb("onUnbind called for intent. action", intent.getAction());
        return true;
    }

    public final boolean zzg(final JobParameters jobParameters) {
        zzfu zzfuVarZzC = zzfu.zzC(this.zza, null, null);
        final zzem zzemVarZzau = zzfuVarZzC.zzau();
        String string = jobParameters.getExtras().getString("action");
        zzfuVarZzC.zzat();
        zzemVarZzau.zzk().zzb("Local AppMeasurementJobService called. action", string);
        if (!"com.google.android.gms.measurement.UPLOAD".equals(string)) {
            return true;
        }
        zzd(new Runnable(this, zzemVarZzau, jobParameters) { // from class: com.google.android.gms.measurement.internal.zzjn
            private final zzjq zza;
            private final zzem zzb;
            private final JobParameters zzc;

            {
                this.zza = this;
                this.zzb = zzemVarZzau;
                this.zzc = jobParameters;
            }

            @Override // java.lang.Runnable
            public final void run() {
                this.zza.zzi(this.zzb, this.zzc);
            }
        });
        return true;
    }

    public final void zzh(Intent intent) {
        if (intent == null) {
            zzk().zzb().zza("onRebind called with null intent");
        } else {
            zzk().zzk().zzb("onRebind called. action", intent.getAction());
        }
    }

    final /* synthetic */ void zzi(zzem zzemVar, JobParameters jobParameters) {
        zzemVar.zzk().zza("AppMeasurementJobService processed last upload request.");
        this.zza.zzb(jobParameters, false);
    }

    final /* synthetic */ void zzj(int i, zzem zzemVar, Intent intent) {
        if (this.zza.zza(i)) {
            zzemVar.zzk().zzb("Local AppMeasurementService processed last upload request. StartId", Integer.valueOf(i));
            zzk().zzk().zza("Completed wakeful intent.");
            this.zza.zzc(intent);
        }
    }
}
