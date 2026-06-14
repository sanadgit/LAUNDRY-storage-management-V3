package com.google.android.gms.internal.measurement;

import kotlin.text.Typography;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public enum zzep implements zzkf {
    UNKNOWN_COMPARISON_TYPE(0),
    LESS_THAN(1),
    GREATER_THAN(2),
    EQUAL(3),
    BETWEEN(4);

    private static final zzkg<zzep> zzf = new zzkg<zzep>() { // from class: com.google.android.gms.internal.measurement.zzen
    };
    private final int zzg;

    zzep(int i) {
        this.zzg = i;
    }

    public static zzep zza(int i) {
        switch (i) {
            case 0:
                return UNKNOWN_COMPARISON_TYPE;
            case 1:
                return LESS_THAN;
            case 2:
                return GREATER_THAN;
            case 3:
                return EQUAL;
            case 4:
                return BETWEEN;
            default:
                return null;
        }
    }

    public static zzkh zzb() {
        return zzeo.zza;
    }

    @Override // java.lang.Enum
    public final String toString() {
        return "<" + getClass().getName() + '@' + Integer.toHexString(System.identityHashCode(this)) + " number=" + this.zzg + " name=" + name() + Typography.greater;
    }
}
