package com.google.firebase.auth.internal;

import android.os.Handler;
import android.os.HandlerThread;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.logging.Logger;
import com.google.android.gms.common.util.DefaultClock;
import com.google.firebase.FirebaseApp;
import kotlinx.coroutines.internal.LockFreeTaskQueueCore;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzam {
    private static final Logger zzg = new Logger("TokenRefresher", "FirebaseAuth:");
    volatile long zza;
    volatile long zzb;
    final long zzc;
    final HandlerThread zzd;
    final Handler zze;
    final Runnable zzf;
    private final FirebaseApp zzh;

    public zzam(FirebaseApp firebaseApp) {
        zzg.v("Initializing TokenRefresher", new Object[0]);
        FirebaseApp firebaseApp2 = (FirebaseApp) Preconditions.checkNotNull(firebaseApp);
        this.zzh = firebaseApp2;
        HandlerThread handlerThread = new HandlerThread("TokenRefresher", 10);
        this.zzd = handlerThread;
        handlerThread.start();
        this.zze = new com.google.android.gms.internal.p001firebaseauthapi.zzg(handlerThread.getLooper());
        this.zzf = new zzal(this, firebaseApp2.getName());
        this.zzc = 300000L;
    }

    public final void zzb() {
        this.zze.removeCallbacks(this.zzf);
    }

    public final void zzc() {
        zzg.v("Scheduling refresh for " + (this.zza - this.zzc), new Object[0]);
        zzb();
        this.zzb = Math.max((this.zza - DefaultClock.getInstance().currentTimeMillis()) - this.zzc, 0L) / 1000;
        this.zze.postDelayed(this.zzf, this.zzb * 1000);
    }

    final void zzd() {
        long j;
        switch ((int) this.zzb) {
            case 30:
            case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
            case 120:
            case 240:
            case 480:
                long j2 = this.zzb;
                j = j2 + j2;
                break;
            case 960:
                j = 960;
                break;
            default:
                j = 30;
                break;
        }
        this.zzb = j;
        this.zza = DefaultClock.getInstance().currentTimeMillis() + (this.zzb * 1000);
        zzg.v("Scheduling refresh for " + this.zza, new Object[0]);
        this.zze.postDelayed(this.zzf, this.zzb * 1000);
    }
}
