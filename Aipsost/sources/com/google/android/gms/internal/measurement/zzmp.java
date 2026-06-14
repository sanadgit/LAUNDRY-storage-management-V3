package com.google.android.gms.internal.measurement;

import sun.misc.Unsafe;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzmp extends zzmq {
    zzmp(Unsafe unsafe) {
        super(unsafe);
    }

    @Override // com.google.android.gms.internal.measurement.zzmq
    public final void zza(Object obj, long j, byte b) {
        if (zzmr.zzb) {
            zzmr.zzD(obj, j, b);
        } else {
            zzmr.zzE(obj, j, b);
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzmq
    public final boolean zzb(Object obj, long j) {
        return zzmr.zzb ? zzmr.zzv(obj, j) : zzmr.zzw(obj, j);
    }

    /* JADX WARN: Failed to inline method: com.google.android.gms.internal.measurement.zzmr.zzx(java.lang.Object, long, boolean):void */
    /* JADX WARN: Failed to inline method: com.google.android.gms.internal.measurement.zzmr.zzy(java.lang.Object, long, boolean):void */
    /* JADX WARN: Unknown register number '(r5v0 boolean)' in method call: com.google.android.gms.internal.measurement.zzmr.zzx(java.lang.Object, long, boolean):void */
    /* JADX WARN: Unknown register number '(r5v0 boolean)' in method call: com.google.android.gms.internal.measurement.zzmr.zzy(java.lang.Object, long, boolean):void */
    @Override // com.google.android.gms.internal.measurement.zzmq
    public final void zzc(Object obj, long j, boolean z) {
        if (zzmr.zzb) {
            zzmr.zzx(obj, j, z);
        } else {
            zzmr.zzy(obj, j, z);
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzmq
    public final float zzd(Object obj, long j) {
        return Float.intBitsToFloat(zzk(obj, j));
    }

    @Override // com.google.android.gms.internal.measurement.zzmq
    public final void zze(Object obj, long j, float f) {
        zzl(obj, j, Float.floatToIntBits(f));
    }

    @Override // com.google.android.gms.internal.measurement.zzmq
    public final double zzf(Object obj, long j) {
        return Double.longBitsToDouble(zzm(obj, j));
    }

    @Override // com.google.android.gms.internal.measurement.zzmq
    public final void zzg(Object obj, long j, double d) {
        zzn(obj, j, Double.doubleToLongBits(d));
    }
}
