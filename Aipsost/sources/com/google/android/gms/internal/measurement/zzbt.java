package com.google.android.gms.internal.measurement;

import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.os.Build;
import android.os.UserHandle;
import android.util.Log;
import java.lang.reflect.Method;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbt {
    private static final Method zza;
    private static final Method zzb;

    static {
        Method declaredMethod;
        Method declaredMethod2 = null;
        if (Build.VERSION.SDK_INT >= 24) {
            try {
                declaredMethod = JobScheduler.class.getDeclaredMethod("scheduleAsPackage", JobInfo.class, String.class, Integer.TYPE, String.class);
            } catch (NoSuchMethodException e) {
                if (Log.isLoggable("JobSchedulerCompat", 6)) {
                    Log.e("JobSchedulerCompat", "No scheduleAsPackage method available, falling back to schedule");
                    declaredMethod = null;
                } else {
                    declaredMethod = null;
                }
            }
        } else {
            declaredMethod = null;
        }
        zza = declaredMethod;
        if (Build.VERSION.SDK_INT >= 24) {
            try {
                declaredMethod2 = UserHandle.class.getDeclaredMethod("myUserId", new Class[0]);
            } catch (NoSuchMethodException e2) {
                if (Log.isLoggable("JobSchedulerCompat", 6)) {
                    Log.e("JobSchedulerCompat", "No myUserId method available");
                }
            }
        }
        zzb = declaredMethod2;
    }

    /* JADX WARN: Removed duplicated region for block: B:22:0x0042  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public static int zza(android.content.Context r5, android.app.job.JobInfo r6, java.lang.String r7, java.lang.String r8) {
        /*
            java.lang.String r7 = "jobscheduler"
            java.lang.Object r7 = r5.getSystemService(r7)
            android.app.job.JobScheduler r7 = (android.app.job.JobScheduler) r7
            if (r7 == 0) goto L7c
            java.lang.reflect.Method r8 = com.google.android.gms.internal.measurement.zzbt.zza
            if (r8 == 0) goto L77
            java.lang.String r8 = "android.permission.UPDATE_DEVICE_STATS"
            int r5 = r5.checkSelfPermission(r8)
            if (r5 == 0) goto L17
            goto L77
        L17:
            java.lang.reflect.Method r5 = com.google.android.gms.internal.measurement.zzbt.zzb
            r8 = 0
            if (r5 == 0) goto L42
            java.lang.Class<android.os.UserHandle> r0 = android.os.UserHandle.class
            java.lang.Object[] r1 = new java.lang.Object[r8]     // Catch: java.lang.reflect.InvocationTargetException -> L2d java.lang.IllegalAccessException -> L2f
            java.lang.Object r5 = r5.invoke(r0, r1)     // Catch: java.lang.reflect.InvocationTargetException -> L2d java.lang.IllegalAccessException -> L2f
            java.lang.Integer r5 = (java.lang.Integer) r5     // Catch: java.lang.reflect.InvocationTargetException -> L2d java.lang.IllegalAccessException -> L2f
            if (r5 == 0) goto L42
            int r5 = r5.intValue()     // Catch: java.lang.reflect.InvocationTargetException -> L2d java.lang.IllegalAccessException -> L2f
            goto L43
        L2d:
            r5 = move-exception
            goto L30
        L2f:
            r5 = move-exception
        L30:
            java.lang.String r0 = "JobSchedulerCompat"
            r1 = 6
            boolean r1 = android.util.Log.isLoggable(r0, r1)
            if (r1 == 0) goto L40
            java.lang.String r1 = "myUserId invocation illegal"
            android.util.Log.e(r0, r1, r5)
            r5 = 0
            goto L43
        L40:
            r5 = 0
            goto L43
        L42:
            r5 = 0
        L43:
            java.lang.String r0 = "com.google.android.gms"
            java.lang.String r1 = "UploadAlarm"
            java.lang.reflect.Method r2 = com.google.android.gms.internal.measurement.zzbt.zza
            if (r2 == 0) goto L72
            r3 = 4
            java.lang.Object[] r3 = new java.lang.Object[r3]     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
            r3[r8] = r6     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
            r4 = 1
            r3[r4] = r0     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
            java.lang.Integer r5 = java.lang.Integer.valueOf(r5)     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
            r0 = 2
            r3[r0] = r5     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
            r5 = 3
            r3[r5] = r1     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
            java.lang.Object r5 = r2.invoke(r7, r3)     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
            java.lang.Integer r5 = (java.lang.Integer) r5     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
            if (r5 == 0) goto L69
            int r8 = r5.intValue()     // Catch: java.lang.reflect.InvocationTargetException -> L6a java.lang.IllegalAccessException -> L6c
        L69:
            goto L76
        L6a:
            r5 = move-exception
            goto L6d
        L6c:
            r5 = move-exception
        L6d:
            java.lang.String r8 = "error calling scheduleAsPackage"
            android.util.Log.e(r1, r8, r5)
        L72:
            int r8 = r7.schedule(r6)
        L76:
            return r8
        L77:
            int r5 = r7.schedule(r6)
            return r5
        L7c:
            r5 = 0
            throw r5
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.measurement.zzbt.zza(android.content.Context, android.app.job.JobInfo, java.lang.String, java.lang.String):int");
    }
}
