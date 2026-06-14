package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzacg {
    public static final /* synthetic */ int zzd = 0;
    private static volatile int zze = 100;
    int zza;
    final int zzb = zze;
    zzach zzc;

    /* synthetic */ zzacg(zzacf zzacfVar) {
    }

    public static int zzs(int i) {
        return (-(i & 1)) ^ (i >>> 1);
    }

    public static long zzt(long j) {
        return (-(j & 1)) ^ (j >>> 1);
    }

    static zzacg zzu(byte[] bArr, int i, int i2, boolean z) {
        zzace zzaceVar = new zzace(bArr, 0, i2, z, null);
        try {
            zzaceVar.zzc(i2);
            return zzaceVar;
        } catch (zzadn e) {
            throw new IllegalArgumentException(e);
        }
    }

    public abstract int zzb();

    public abstract int zzc(int i) throws zzadn;

    public abstract int zzf() throws IOException;

    public abstract zzacc zzj() throws IOException;

    public abstract String zzk() throws IOException;

    public abstract String zzl() throws IOException;

    public abstract void zzm(int i) throws zzadn;

    public abstract void zzn(int i);

    public abstract boolean zzp() throws IOException;

    public abstract boolean zzq() throws IOException;

    public abstract boolean zzr(int i) throws IOException;
}
