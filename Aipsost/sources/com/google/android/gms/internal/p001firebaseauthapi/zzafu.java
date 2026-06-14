package com.google.android.gms.internal.p001firebaseauthapi;

import sun.misc.Unsafe;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzafu extends zzafw {
    zzafu(Unsafe unsafe) {
        super(unsafe);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafw
    public final double zza(Object obj, long j) {
        return Double.longBitsToDouble(zzk(obj, j));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafw
    public final float zzb(Object obj, long j) {
        return Float.intBitsToFloat(zzj(obj, j));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafw
    public final void zzc(Object obj, long j, boolean z) {
        if (zzafx.zzb) {
            zzafx.zzD(obj, j, z ? (byte) 1 : (byte) 0);
        } else {
            zzafx.zzE(obj, j, z ? (byte) 1 : (byte) 0);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafw
    public final void zzd(Object obj, long j, byte b) {
        if (zzafx.zzb) {
            zzafx.zzD(obj, j, b);
        } else {
            zzafx.zzE(obj, j, b);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafw
    public final void zze(Object obj, long j, double d) {
        zzo(obj, j, Double.doubleToLongBits(d));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafw
    public final void zzf(Object obj, long j, float f) {
        zzn(obj, j, Float.floatToIntBits(f));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafw
    public final boolean zzg(Object obj, long j) {
        return zzafx.zzb ? zzafx.zzt(obj, j) : zzafx.zzu(obj, j);
    }
}
