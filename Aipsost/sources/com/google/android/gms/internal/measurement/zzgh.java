package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgh extends zzkd<zzgh, zzgg> implements zzlj {
    private static final zzgh zzk;
    private int zza;
    private long zze;
    private String zzf = "";
    private String zzg = "";
    private long zzh;
    private float zzi;
    private double zzj;

    static {
        zzgh zzghVar = new zzgh();
        zzk = zzghVar;
        zzkd.zzby(zzgh.class, zzghVar);
    }

    private zzgh() {
    }

    public static zzgg zzj() {
        return zzk.zzbt();
    }

    static /* synthetic */ void zzm(zzgh zzghVar, long j) {
        zzghVar.zza |= 1;
        zzghVar.zze = j;
    }

    static /* synthetic */ void zzn(zzgh zzghVar, String str) {
        str.getClass();
        zzghVar.zza |= 2;
        zzghVar.zzf = str;
    }

    static /* synthetic */ void zzo(zzgh zzghVar, String str) {
        str.getClass();
        zzghVar.zza |= 4;
        zzghVar.zzg = str;
    }

    static /* synthetic */ void zzp(zzgh zzghVar) {
        zzghVar.zza &= -5;
        zzghVar.zzg = zzk.zzg;
    }

    static /* synthetic */ void zzq(zzgh zzghVar, long j) {
        zzghVar.zza |= 8;
        zzghVar.zzh = j;
    }

    static /* synthetic */ void zzr(zzgh zzghVar) {
        zzghVar.zza &= -9;
        zzghVar.zzh = 0L;
    }

    static /* synthetic */ void zzs(zzgh zzghVar, double d) {
        zzghVar.zza |= 32;
        zzghVar.zzj = d;
    }

    static /* synthetic */ void zzt(zzgh zzghVar) {
        zzghVar.zza &= -33;
        zzghVar.zzj = 0.0d;
    }

    public final boolean zza() {
        return (this.zza & 1) != 0;
    }

    public final long zzb() {
        return this.zze;
    }

    public final String zzc() {
        return this.zzf;
    }

    public final boolean zzd() {
        return (this.zza & 4) != 0;
    }

    public final String zze() {
        return this.zzg;
    }

    public final boolean zzf() {
        return (this.zza & 8) != 0;
    }

    public final long zzg() {
        return this.zzh;
    }

    public final boolean zzh() {
        return (this.zza & 32) != 0;
    }

    public final double zzi() {
        return this.zzj;
    }

    @Override // com.google.android.gms.internal.measurement.zzkd
    protected final Object zzl(int i, Object obj, Object obj2) {
        zzff zzffVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzbz(zzk, "\u0001\u0006\u0000\u0001\u0001\u0006\u0006\u0000\u0000\u0000\u0001ဂ\u0000\u0002ဈ\u0001\u0003ဈ\u0002\u0004ဂ\u0003\u0005ခ\u0004\u0006က\u0005", new Object[]{"zza", "zze", "zzf", "zzg", "zzh", "zzi", "zzj"});
            case 3:
                return new zzgh();
            case 4:
                return new zzgg(zzffVar);
            case 5:
                return zzk;
        }
    }
}
