package com.google.android.gms.internal.measurement;

import java.io.Serializable;
import org.checkerframework.checker.nullness.compatqual.NullableDecl;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzif {
    public static <T> zzib<T> zza(zzib<T> zzibVar) {
        return ((zzibVar instanceof zzid) || (zzibVar instanceof zzic)) ? zzibVar : zzibVar instanceof Serializable ? new zzic(zzibVar) : new zzid(zzibVar);
    }

    public static <T> zzib<T> zzb(@NullableDecl T t) {
        return new zzie(t);
    }
}
