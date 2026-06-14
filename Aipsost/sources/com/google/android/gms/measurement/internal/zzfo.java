package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;
import java.lang.Thread;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfo implements Thread.UncaughtExceptionHandler {
    final /* synthetic */ zzfr zza;
    private final String zzb;

    public zzfo(zzfr zzfrVar, String str) {
        this.zza = zzfrVar;
        Preconditions.checkNotNull(str);
        this.zzb = str;
    }

    @Override // java.lang.Thread.UncaughtExceptionHandler
    public final synchronized void uncaughtException(Thread thread, Throwable th) {
        this.zza.zzs.zzau().zzb().zzb(this.zzb, th);
    }
}
