package com.google.android.gms.internal.p001firebaseauthapi;

import sun.misc.Unsafe;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzafv extends zzafw {
    zzafv(Unsafe unsafe) {
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

    /* JADX WARN: Failed to inline method: com.google.android.gms.internal.firebase-auth-api.zzafx.zzi(java.lang.Object, long, boolean):void */
    /* JADX WARN: Failed to inline method: com.google.android.gms.internal.firebase-auth-api.zzafx.zzj(java.lang.Object, long, boolean):void */
    /* JADX WARN: Unknown register number '(r5v0 boolean)' in method call: com.google.android.gms.internal.firebase-auth-api.zzafx.zzi(java.lang.Object, long, boolean):void */
    /* JADX WARN: Unknown register number '(r5v0 boolean)' in method call: com.google.android.gms.internal.firebase-auth-api.zzafx.zzj(java.lang.Object, long, boolean):void */
    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafw
    public final void zzc(Object obj, long j, boolean z) {
        if (zzafx.zzb) {
            zzafx.zzi(obj, j, z);
        } else {
            zzafx.zzj(obj, j, z);
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
