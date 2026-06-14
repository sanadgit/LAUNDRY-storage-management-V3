package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final /* synthetic */ class zzs {
    static final /* synthetic */ int[] zza;
    static final /* synthetic */ int[] zzb;

    static {
        int[] iArr = new int[com.google.android.gms.internal.measurement.zzep.values().length];
        zzb = iArr;
        try {
            iArr[com.google.android.gms.internal.measurement.zzep.LESS_THAN.ordinal()] = 1;
        } catch (NoSuchFieldError e) {
        }
        try {
            zzb[com.google.android.gms.internal.measurement.zzep.GREATER_THAN.ordinal()] = 2;
        } catch (NoSuchFieldError e2) {
        }
        try {
            zzb[com.google.android.gms.internal.measurement.zzep.EQUAL.ordinal()] = 3;
        } catch (NoSuchFieldError e3) {
        }
        try {
            zzb[com.google.android.gms.internal.measurement.zzep.BETWEEN.ordinal()] = 4;
        } catch (NoSuchFieldError e4) {
        }
        int[] iArr2 = new int[com.google.android.gms.internal.measurement.zzew.values().length];
        zza = iArr2;
        try {
            iArr2[com.google.android.gms.internal.measurement.zzew.REGEXP.ordinal()] = 1;
        } catch (NoSuchFieldError e5) {
        }
        try {
            zza[com.google.android.gms.internal.measurement.zzew.BEGINS_WITH.ordinal()] = 2;
        } catch (NoSuchFieldError e6) {
        }
        try {
            zza[com.google.android.gms.internal.measurement.zzew.ENDS_WITH.ordinal()] = 3;
        } catch (NoSuchFieldError e7) {
        }
        try {
            zza[com.google.android.gms.internal.measurement.zzew.PARTIAL.ordinal()] = 4;
        } catch (NoSuchFieldError e8) {
        }
        try {
            zza[com.google.android.gms.internal.measurement.zzew.EXACT.ordinal()] = 5;
        } catch (NoSuchFieldError e9) {
        }
        try {
            zza[com.google.android.gms.internal.measurement.zzew.IN_LIST.ordinal()] = 6;
        } catch (NoSuchFieldError e10) {
        }
    }
}
