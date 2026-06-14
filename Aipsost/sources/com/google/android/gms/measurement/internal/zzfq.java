package com.google.android.gms.measurement.internal;

import android.os.Process;
import com.google.android.gms.common.internal.Preconditions;
import java.util.concurrent.BlockingQueue;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfq extends Thread {
    final /* synthetic */ zzfr zza;
    private final Object zzb;
    private final BlockingQueue<zzfp<?>> zzc;
    private boolean zzd = false;

    public zzfq(zzfr zzfrVar, String str, BlockingQueue<zzfp<?>> blockingQueue) {
        this.zza = zzfrVar;
        Preconditions.checkNotNull(str);
        Preconditions.checkNotNull(blockingQueue);
        this.zzb = new Object();
        this.zzc = blockingQueue;
        setName(str);
    }

    private final void zzb() {
        synchronized (this.zza.zzg) {
            if (!this.zzd) {
                this.zza.zzh.release();
                this.zza.zzg.notifyAll();
                if (this == this.zza.zza) {
                    zzfr.zzp(this.zza, null);
                } else if (this == this.zza.zzb) {
                    zzfr.zzr(this.zza, null);
                } else {
                    this.zza.zzs.zzau().zzb().zza("Current scheduler thread is neither worker nor network");
                }
                this.zzd = true;
            }
        }
    }

    private final void zzc(InterruptedException interruptedException) {
        this.zza.zzs.zzau().zze().zzb(String.valueOf(getName()).concat(" was interrupted"), interruptedException);
    }

    @Override // java.lang.Thread, java.lang.Runnable
    public final void run() {
        boolean z = false;
        while (!z) {
            try {
                this.zza.zzh.acquire();
                z = true;
            } catch (InterruptedException e) {
                zzc(e);
            }
        }
        try {
            int threadPriority = Process.getThreadPriority(Process.myTid());
            while (true) {
                zzfp<?> zzfpVarPoll = this.zzc.poll();
                if (zzfpVarPoll == null) {
                    synchronized (this.zzb) {
                        if (this.zzc.peek() == null) {
                            zzfr.zzm(this.zza);
                            try {
                                this.zzb.wait(30000L);
                            } catch (InterruptedException e2) {
                                zzc(e2);
                            }
                        }
                    }
                    synchronized (this.zza.zzg) {
                        if (this.zzc.peek() == null) {
                            break;
                        }
                    }
                } else {
                    Process.setThreadPriority(true != zzfpVarPoll.zza ? 10 : threadPriority);
                    zzfpVarPoll.run();
                }
            }
            if (this.zza.zzs.zzc().zzn(null, zzea.zzao)) {
                zzb();
            }
        } finally {
            zzb();
        }
    }

    public final void zza() {
        synchronized (this.zzb) {
            this.zzb.notifyAll();
        }
    }
}
