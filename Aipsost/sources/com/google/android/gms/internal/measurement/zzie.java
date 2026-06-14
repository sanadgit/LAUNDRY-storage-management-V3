package com.google.android.gms.internal.measurement;

import java.io.Serializable;
import java.util.Arrays;
import org.checkerframework.checker.nullness.compatqual.NullableDecl;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzie<T> implements Serializable, zzib {

    @NullableDecl
    final T zza;

    zzie(@NullableDecl T t) {
        this.zza = t;
    }

    public final boolean equals(@NullableDecl Object obj) {
        if (!(obj instanceof zzie)) {
            return false;
        }
        T t = this.zza;
        T t2 = ((zzie) obj).zza;
        return t == t2 || t.equals(t2);
    }

    public final int hashCode() {
        return Arrays.hashCode(new Object[]{this.zza});
    }

    public final String toString() {
        String strValueOf = String.valueOf(this.zza);
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 22);
        sb.append("Suppliers.ofInstance(");
        sb.append(strValueOf);
        sb.append(")");
        return sb.toString();
    }

    @Override // com.google.android.gms.internal.measurement.zzib
    public final T zza() {
        return this.zza;
    }
}
