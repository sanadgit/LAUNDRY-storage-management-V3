package com.google.android.gms.measurement;

import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Intent;
import com.google.android.gms.measurement.internal.zzjp;
import com.google.android.gms.measurement.internal.zzjq;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class AppMeasurementJobService extends JobService implements zzjp {
    private zzjq<AppMeasurementJobService> zza;

    private final zzjq<AppMeasurementJobService> zzd() {
        if (this.zza == null) {
            this.zza = new zzjq<>(this);
        }
        return this.zza;
    }

    @Override // android.app.Service
    public void onCreate() {
        super.onCreate();
        zzd().zza();
    }

    @Override // android.app.Service
    public void onDestroy() {
        zzd().zzb();
        super.onDestroy();
    }

    @Override // android.app.Service
    public void onRebind(Intent intent) {
        zzd().zzh(intent);
    }

    @Override // android.app.job.JobService
    public boolean onStartJob(JobParameters params) {
        zzd().zzg(params);
        return true;
    }

    @Override // android.app.job.JobService
    public boolean onStopJob(JobParameters jobParameters) {
        return false;
    }

    @Override // android.app.Service
    public boolean onUnbind(Intent intent) {
        zzd().zzf(intent);
        return true;
    }

    @Override // com.google.android.gms.measurement.internal.zzjp
    public final boolean zza(int i) {
        throw new UnsupportedOperationException();
    }

    @Override // com.google.android.gms.measurement.internal.zzjp
    public final void zzb(JobParameters jobParameters, boolean z) {
        jobFinished(jobParameters, false);
    }

    @Override // com.google.android.gms.measurement.internal.zzjp
    public final void zzc(Intent intent) {
    }
}
