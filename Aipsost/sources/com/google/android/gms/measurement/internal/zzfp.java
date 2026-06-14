package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;
import java.lang.Thread;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfp<V> extends FutureTask<V> implements Comparable<zzfp<V>> {
    final boolean zza;
    final /* synthetic */ zzfr zzb;
    private final long zzc;
    private final String zzd;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzfp(zzfr zzfrVar, Runnable runnable, boolean z, String str) {
        super(runnable, null);
        this.zzb = zzfrVar;
        Preconditions.checkNotNull(str);
        long andIncrement = zzfr.zzj.getAndIncrement();
        this.zzc = andIncrement;
        this.zzd = str;
        this.zza = z;
        if (andIncrement == Long.MAX_VALUE) {
            zzfrVar.zzs.zzau().zzb().zza("Tasks index overflow");
        }
    }

    @Override // java.lang.Comparable
    public final /* bridge */ /* synthetic */ int compareTo(Object obj) {
        zzfp zzfpVar = (zzfp) obj;
        boolean z = this.zza;
        if (z != zzfpVar.zza) {
            return !z ? 1 : -1;
        }
        long j = this.zzc;
        long j2 = zzfpVar.zzc;
        if (j < j2) {
            return -1;
        }
        if (j > j2) {
            return 1;
        }
        this.zzb.zzs.zzau().zzc().zzb("Two tasks share the same index. index", Long.valueOf(this.zzc));
        return 0;
    }

    @Override // java.util.concurrent.FutureTask
    protected final void setException(Throwable th) {
        Thread.UncaughtExceptionHandler defaultUncaughtExceptionHandler;
        this.zzb.zzs.zzau().zzb().zzb(this.zzd, th);
        if ((th instanceof zzfn) && (defaultUncaughtExceptionHandler = Thread.getDefaultUncaughtExceptionHandler()) != null) {
            defaultUncaughtExceptionHandler.uncaughtException(Thread.currentThread(), th);
        }
        super.setException(th);
    }

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzfp(zzfr zzfrVar, Callable<V> callable, boolean z, String str) {
        super(callable);
        this.zzb = zzfrVar;
        Preconditions.checkNotNull("Task exception on worker thread");
        long andIncrement = zzfr.zzj.getAndIncrement();
        this.zzc = andIncrement;
        this.zzd = "Task exception on worker thread";
        this.zza = z;
        if (andIncrement == Long.MAX_VALUE) {
            zzfrVar.zzs.zzau().zzb().zza("Tasks index overflow");
        }
    }
}
