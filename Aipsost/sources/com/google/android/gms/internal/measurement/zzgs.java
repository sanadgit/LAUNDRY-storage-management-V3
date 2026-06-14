package com.google.android.gms.internal.measurement;

import kotlin.text.Typography;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public enum zzgs implements zzkf {
    UNKNOWN(0),
    STRING(1),
    NUMBER(2),
    BOOLEAN(3),
    STATEMENT(4);

    private static final zzkg<zzgs> zzf = new zzkg<zzgs>() { // from class: com.google.android.gms.internal.measurement.zzgq
    };
    private final int zzg;

    zzgs(int i) {
        this.zzg = i;
    }

    public static zzgs zza(int i) {
        switch (i) {
            case 0:
                return UNKNOWN;
            case 1:
                return STRING;
            case 2:
                return NUMBER;
            case 3:
                return BOOLEAN;
            case 4:
                return STATEMENT;
            default:
                return null;
        }
    }

    public static zzkh zzb() {
        return zzgr.zza;
    }

    @Override // java.lang.Enum
    public final String toString() {
        return "<" + getClass().getName() + '@' + Integer.toHexString(System.identityHashCode(this)) + " number=" + this.zzg + " name=" + name() + Typography.greater;
    }
}
