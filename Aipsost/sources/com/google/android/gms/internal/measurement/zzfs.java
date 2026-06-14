package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfs extends zzkd<zzfs, zzfr> implements zzlj {
    private static final zzfs zzk;
    private int zza;
    private long zzg;
    private float zzh;
    private double zzi;
    private String zze = "";
    private String zzf = "";
    private zzkk<zzfs> zzj = zzbE();

    static {
        zzfs zzfsVar = new zzfs();
        zzk = zzfsVar;
        zzkd.zzby(zzfs.class, zzfsVar);
    }

    private zzfs() {
    }

    public static zzfr zzn() {
        return zzk.zzbt();
    }

    static /* synthetic */ void zzp(zzfs zzfsVar, String str) {
        str.getClass();
        zzfsVar.zza |= 1;
        zzfsVar.zze = str;
    }

    static /* synthetic */ void zzq(zzfs zzfsVar, String str) {
        str.getClass();
        zzfsVar.zza |= 2;
        zzfsVar.zzf = str;
    }

    static /* synthetic */ void zzr(zzfs zzfsVar) {
        zzfsVar.zza &= -3;
        zzfsVar.zzf = zzk.zzf;
    }

    static /* synthetic */ void zzs(zzfs zzfsVar, long j) {
        zzfsVar.zza |= 4;
        zzfsVar.zzg = j;
    }

    static /* synthetic */ void zzt(zzfs zzfsVar) {
        zzfsVar.zza &= -5;
        zzfsVar.zzg = 0L;
    }

    static /* synthetic */ void zzu(zzfs zzfsVar, double d) {
        zzfsVar.zza |= 16;
        zzfsVar.zzi = d;
    }

    static /* synthetic */ void zzv(zzfs zzfsVar) {
        zzfsVar.zza &= -17;
        zzfsVar.zzi = 0.0d;
    }

    static /* synthetic */ void zzw(zzfs zzfsVar, zzfs zzfsVar2) {
        zzfsVar2.getClass();
        zzfsVar.zzz();
        zzfsVar.zzj.add(zzfsVar2);
    }

    static /* synthetic */ void zzx(zzfs zzfsVar, Iterable iterable) {
        zzfsVar.zzz();
        zzio.zzbs(iterable, zzfsVar.zzj);
    }

    private final void zzz() {
        zzkk<zzfs> zzkkVar = this.zzj;
        if (zzkkVar.zza()) {
            return;
        }
        this.zzj = zzkd.zzbF(zzkkVar);
    }

    public final boolean zza() {
        return (this.zza & 1) != 0;
    }

    public final String zzb() {
        return this.zze;
    }

    public final boolean zzc() {
        return (this.zza & 2) != 0;
    }

    public final String zzd() {
        return this.zzf;
    }

    public final boolean zze() {
        return (this.zza & 4) != 0;
    }

    public final long zzf() {
        return this.zzg;
    }

    public final boolean zzg() {
        return (this.zza & 8) != 0;
    }

    public final float zzh() {
        return this.zzh;
    }

    public final boolean zzi() {
        return (this.zza & 16) != 0;
    }

    public final double zzj() {
        return this.zzi;
    }

    public final List<zzfs> zzk() {
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
                return zzbz(zzk, "\u0001\u0006\u0000\u0001\u0001\u0006\u0006\u0000\u0001\u0000\u0001ဈ\u0000\u0002ဈ\u0001\u0003ဂ\u0002\u0004ခ\u0003\u0005က\u0004\u0006\u001b", new Object[]{"zza", "zze", "zzf", "zzg", "zzh", "zzi", "zzj", zzfs.class});
            case 3:
                return new zzfs();
            case 4:
                return new zzfr(zzffVar);
            case 5:
                return zzk;
        }
    }

    public final int zzm() {
        return this.zzj.size();
    }
}
