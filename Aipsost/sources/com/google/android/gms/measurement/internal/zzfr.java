package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;
import java.lang.Thread;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfr extends zzgo {
    private static final AtomicLong zzj = new AtomicLong(Long.MIN_VALUE);
    private zzfq zza;
    private zzfq zzb;
    private final PriorityBlockingQueue<zzfp<?>> zzc;
    private final BlockingQueue<zzfp<?>> zzd;
    private final Thread.UncaughtExceptionHandler zze;
    private final Thread.UncaughtExceptionHandler zzf;
    private final Object zzg;
    private final Semaphore zzh;
    private volatile boolean zzi;

    zzfr(zzfu zzfuVar) {
        super(zzfuVar);
        this.zzg = new Object();
        this.zzh = new Semaphore(2);
        this.zzc = new PriorityBlockingQueue<>();
        this.zzd = new LinkedBlockingQueue();
        this.zze = new zzfo(this, "Thread death: Uncaught exception on worker thread");
        this.zzf = new zzfo(this, "Thread death: Uncaught exception on network thread");
    }

    static /* synthetic */ boolean zzm(zzfr zzfrVar) {
        boolean z = zzfrVar.zzi;
        return false;
    }

    static /* synthetic */ zzfq zzp(zzfr zzfrVar, zzfq zzfqVar) {
        zzfrVar.zza = null;
        return null;
    }

    static /* synthetic */ zzfq zzr(zzfr zzfrVar, zzfq zzfqVar) {
        zzfrVar.zzb = null;
        return null;
    }

    private final void zzt(zzfp<?> zzfpVar) {
        synchronized (this.zzg) {
            this.zzc.add(zzfpVar);
            zzfq zzfqVar = this.zza;
            if (zzfqVar == null) {
                zzfq zzfqVar2 = new zzfq(this, "Measurement Worker", this.zzc);
                this.zza = zzfqVar2;
                zzfqVar2.setUncaughtExceptionHandler(this.zze);
                this.zza.start();
            } else {
                zzfqVar.zza();
            }
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    protected final boolean zza() {
        return false;
    }

    @Override // com.google.android.gms.measurement.internal.zzgn
    public final void zzaw() {
        if (Thread.currentThread() != this.zzb) {
            throw new IllegalStateException("Call expected from network thread");
        }
    }

    public final boolean zzd() {
        return Thread.currentThread() == this.zza;
    }

    public final <V> Future<V> zze(Callable<V> callable) throws IllegalStateException {
        zzv();
        Preconditions.checkNotNull(callable);
        zzfp<?> zzfpVar = new zzfp<>(this, (Callable<?>) callable, false, "Task exception on worker thread");
        if (Thread.currentThread() == this.zza) {
            if (!this.zzc.isEmpty()) {
                this.zzs.zzau().zze().zza("Callable skipped the worker queue.");
            }
            zzfpVar.run();
        } else {
            zzt(zzfpVar);
        }
        return zzfpVar;
    }

    public final <V> Future<V> zzf(Callable<V> callable) throws IllegalStateException {
        zzv();
        Preconditions.checkNotNull(callable);
        zzfp<?> zzfpVar = new zzfp<>(this, (Callable<?>) callable, true, "Task exception on worker thread");
        if (Thread.currentThread() == this.zza) {
            zzfpVar.run();
        } else {
            zzt(zzfpVar);
        }
        return zzfpVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzgn
    public final void zzg() {
        if (Thread.currentThread() != this.zza) {
            throw new IllegalStateException("Call expected from worker thread");
        }
    }

    public final void zzh(Runnable runnable) throws IllegalStateException {
        zzv();
        Preconditions.checkNotNull(runnable);
        zzt(new zzfp<>(this, runnable, false, "Task exception on worker thread"));
    }

    final <T> T zzi(AtomicReference<T> atomicReference, long j, String str, Runnable runnable) {
        synchronized (atomicReference) {
            this.zzs.zzav().zzh(runnable);
            try {
                atomicReference.wait(j);
            } catch (InterruptedException e) {
                this.zzs.zzau().zze().zza(str.length() != 0 ? "Interrupted waiting for ".concat(str) : new String("Interrupted waiting for "));
                return null;
            }
        }
        T t = atomicReference.get();
        if (t == null) {
            this.zzs.zzau().zze().zza(str.length() != 0 ? "Timed out waiting for ".concat(str) : new String("Timed out waiting for "));
        }
        return t;
    }

    public final void zzj(Runnable runnable) throws IllegalStateException {
        zzv();
        Preconditions.checkNotNull(runnable);
        zzt(new zzfp<>(this, runnable, true, "Task exception on worker thread"));
    }

    public final void zzk(Runnable runnable) throws IllegalStateException {
        zzv();
        Preconditions.checkNotNull(runnable);
        zzfp<?> zzfpVar = new zzfp<>(this, runnable, false, "Task exception on network thread");
        synchronized (this.zzg) {
            this.zzd.add(zzfpVar);
            zzfq zzfqVar = this.zzb;
            if (zzfqVar == null) {
                zzfq zzfqVar2 = new zzfq(this, "Measurement Network", this.zzd);
                this.zzb = zzfqVar2;
                zzfqVar2.setUncaughtExceptionHandler(this.zzf);
                this.zzb.start();
            } else {
                zzfqVar.zza();
            }
        }
    }
}
