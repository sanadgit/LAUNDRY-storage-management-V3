package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzdz<V> {
    private static final Object zzf = new Object();
    private final String zza;
    private final zzdx<V> zzb;
    private final V zzc;
    private final V zzd;
    private final Object zze = new Object();
    private volatile V zzg = null;
    private volatile V zzh = null;

    /* JADX WARN: Multi-variable type inference failed */
    /* synthetic */ zzdz(String str, Object obj, Object obj2, zzdx zzdxVar, zzdw zzdwVar) {
        this.zza = str;
        this.zzc = obj;
        this.zzd = obj2;
        this.zzb = zzdxVar;
    }

    public final String zza() {
        return this.zza;
    }

    /* JADX WARN: Removed duplicated region for block: B:69:0x0060 A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final V zzb(V r4) {
        /*
            r3 = this;
            java.lang.Object r0 = r3.zze
            monitor-enter(r0)
            monitor-exit(r0)     // Catch: java.lang.Throwable -> L6f
            if (r4 == 0) goto L7
            return r4
        L7:
            com.google.android.gms.measurement.internal.zzz r4 = com.google.android.gms.measurement.internal.zzdy.zza
            if (r4 == 0) goto L6c
            java.lang.Object r4 = com.google.android.gms.measurement.internal.zzdz.zzf
            monitor-enter(r4)
            boolean r0 = com.google.android.gms.measurement.internal.zzz.zza()     // Catch: java.lang.Throwable -> L69
            if (r0 == 0) goto L1f
            V r0 = r3.zzh     // Catch: java.lang.Throwable -> L69
            if (r0 != 0) goto L1b
            V r0 = r3.zzc     // Catch: java.lang.Throwable -> L69
            goto L1d
        L1b:
            V r0 = r3.zzh     // Catch: java.lang.Throwable -> L69
        L1d:
            monitor-exit(r4)     // Catch: java.lang.Throwable -> L69
            return r0
        L1f:
            monitor-exit(r4)     // Catch: java.lang.Throwable -> L69
            java.util.List r4 = com.google.android.gms.measurement.internal.zzea.zzc()     // Catch: java.lang.SecurityException -> L58
            java.util.Iterator r4 = r4.iterator()     // Catch: java.lang.SecurityException -> L58
        L28:
            boolean r0 = r4.hasNext()     // Catch: java.lang.SecurityException -> L58
            if (r0 == 0) goto L59
            java.lang.Object r0 = r4.next()     // Catch: java.lang.SecurityException -> L58
            com.google.android.gms.measurement.internal.zzdz r0 = (com.google.android.gms.measurement.internal.zzdz) r0     // Catch: java.lang.SecurityException -> L58
            boolean r1 = com.google.android.gms.measurement.internal.zzz.zza()     // Catch: java.lang.SecurityException -> L58
            if (r1 != 0) goto L50
            r1 = 0
            com.google.android.gms.measurement.internal.zzdx<V> r2 = r0.zzb     // Catch: java.lang.IllegalStateException -> L45 java.lang.SecurityException -> L58
            if (r2 == 0) goto L44
            java.lang.Object r1 = r2.zza()     // Catch: java.lang.IllegalStateException -> L45 java.lang.SecurityException -> L58
            goto L46
        L44:
            goto L46
        L45:
            r2 = move-exception
        L46:
            java.lang.Object r2 = com.google.android.gms.measurement.internal.zzdz.zzf     // Catch: java.lang.SecurityException -> L58
            monitor-enter(r2)     // Catch: java.lang.SecurityException -> L58
            r0.zzh = r1     // Catch: java.lang.Throwable -> L4d
            monitor-exit(r2)     // Catch: java.lang.Throwable -> L4d
            goto L28
        L4d:
            r4 = move-exception
            monitor-exit(r2)     // Catch: java.lang.Throwable -> L4d
            throw r4     // Catch: java.lang.SecurityException -> L58
        L50:
            java.lang.IllegalStateException r4 = new java.lang.IllegalStateException     // Catch: java.lang.SecurityException -> L58
            java.lang.String r0 = "Refreshing flag cache must be done on a worker thread."
            r4.<init>(r0)     // Catch: java.lang.SecurityException -> L58
            throw r4     // Catch: java.lang.SecurityException -> L58
        L58:
            r4 = move-exception
        L59:
            com.google.android.gms.measurement.internal.zzdx<V> r4 = r3.zzb
            if (r4 != 0) goto L60
        L5d:
            V r4 = r3.zzc
            return r4
        L60:
            java.lang.Object r4 = r4.zza()     // Catch: java.lang.IllegalStateException -> L65 java.lang.SecurityException -> L67
            return r4
        L65:
            r4 = move-exception
            goto L5d
        L67:
            r4 = move-exception
            goto L5d
        L69:
            r0 = move-exception
            monitor-exit(r4)     // Catch: java.lang.Throwable -> L69
            throw r0
        L6c:
            V r4 = r3.zzc
            return r4
        L6f:
            r4 = move-exception
            monitor-exit(r0)     // Catch: java.lang.Throwable -> L6f
            throw r4
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzdz.zzb(java.lang.Object):java.lang.Object");
    }
}
