package com.google.android.gms.measurement.internal;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PersistableBundle;
import androidx.core.app.NotificationCompat;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkc extends zzke {
    private final AlarmManager zza;
    private zzal zzb;
    private Integer zzc;

    protected zzkc(zzkn zzknVar) {
        super(zzknVar);
        this.zza = (AlarmManager) this.zzs.zzax().getSystemService(NotificationCompat.CATEGORY_ALARM);
    }

    private final zzal zzf() {
        if (this.zzb == null) {
            this.zzb = new zzkb(this, this.zzf.zzN());
        }
        return this.zzb;
    }

    private final void zzh() {
        JobScheduler jobScheduler = (JobScheduler) this.zzs.zzax().getSystemService("jobscheduler");
        if (jobScheduler != null) {
            jobScheduler.cancel(zzi());
        }
    }

    private final int zzi() {
        if (this.zzc == null) {
            String strValueOf = String.valueOf(this.zzs.zzax().getPackageName());
            this.zzc = Integer.valueOf((strValueOf.length() != 0 ? "measurement".concat(strValueOf) : new String("measurement")).hashCode());
        }
        return this.zzc.intValue();
    }

    private final PendingIntent zzj() {
        Context contextZzax = this.zzs.zzax();
        return com.google.android.gms.internal.measurement.zzbs.zza(contextZzax, 0, new Intent().setClassName(contextZzax, "com.google.android.gms.measurement.AppMeasurementReceiver").setAction("com.google.android.gms.measurement.UPLOAD"), com.google.android.gms.internal.measurement.zzbs.zza);
    }

    @Override // com.google.android.gms.measurement.internal.zzke
    protected final boolean zzaA() {
        AlarmManager alarmManager = this.zza;
        if (alarmManager != null) {
            alarmManager.cancel(zzj());
        }
        if (Build.VERSION.SDK_INT < 24) {
            return false;
        }
        zzh();
        return false;
    }

    public final void zzc(long j) {
        zzZ();
        this.zzs.zzat();
        Context contextZzax = this.zzs.zzax();
        if (!zzku.zzam(contextZzax)) {
            this.zzs.zzau().zzj().zza("Receiver not registered/enabled");
        }
        if (!zzku.zzP(contextZzax, false)) {
            this.zzs.zzau().zzj().zza("Service not registered/enabled");
        }
        zzd();
        this.zzs.zzau().zzk().zzb("Scheduling upload, millis", Long.valueOf(j));
        long jElapsedRealtime = this.zzs.zzay().elapsedRealtime() + j;
        this.zzs.zzc();
        if (j < Math.max(0L, zzea.zzw.zzb(null).longValue()) && !zzf().zzc()) {
            zzf().zzb(j);
        }
        this.zzs.zzat();
        if (Build.VERSION.SDK_INT < 24) {
            AlarmManager alarmManager = this.zza;
            if (alarmManager != null) {
                this.zzs.zzc();
                alarmManager.setInexactRepeating(2, jElapsedRealtime, Math.max(zzea.zzr.zzb(null).longValue(), j), zzj());
                return;
            }
            return;
        }
        Context contextZzax2 = this.zzs.zzax();
        ComponentName componentName = new ComponentName(contextZzax2, "com.google.android.gms.measurement.AppMeasurementJobService");
        int iZzi = zzi();
        PersistableBundle persistableBundle = new PersistableBundle();
        persistableBundle.putString("action", "com.google.android.gms.measurement.UPLOAD");
        com.google.android.gms.internal.measurement.zzbt.zza(contextZzax2, new JobInfo.Builder(iZzi, componentName).setMinimumLatency(j).setOverrideDeadline(j + j).setExtras(persistableBundle).build(), "com.google.android.gms", "UploadAlarm");
    }

    public final void zzd() {
        zzZ();
        this.zzs.zzau().zzk().zza("Unscheduling upload");
        AlarmManager alarmManager = this.zza;
        if (alarmManager != null) {
            alarmManager.cancel(zzj());
        }
        zzf().zzd();
        if (Build.VERSION.SDK_INT >= 24) {
            zzh();
        }
    }
}
