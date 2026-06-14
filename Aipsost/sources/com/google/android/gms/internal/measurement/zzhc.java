package com.google.android.gms.internal.measurement;

import android.os.Binder;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final /* synthetic */ class zzhc {
    public static <V> V zza(zzhd<V> zzhdVar) {
        try {
            return zzhdVar.zza();
        } catch (SecurityException e) {
            long jClearCallingIdentity = Binder.clearCallingIdentity();
            try {
                return zzhdVar.zza();
            } finally {
                Binder.restoreCallingIdentity(jClearCallingIdentity);
            }
        }
    }
}
