package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfo extends zzkd<zzfo, zzfn> implements zzlj {
    private static final zzfo zzj;
    private int zza;
    private zzkk<zzfs> zze = zzbE();
    private String zzf = "";
    private long zzg;
    private long zzh;
    private int zzi;

    static {
        zzfo zzfoVar = new zzfo();
        zzj = zzfoVar;
        zzkd.zzby(zzfo.class, zzfoVar);
    }

    private zzfo() {
    }

    public static zzfn zzk() {
        return zzj.zzbt();
    }

    static /* synthetic */ void zzn(zzfo zzfoVar, int i, zzfs zzfsVar) {
        zzfsVar.getClass();
        zzfoVar.zzv();
        zzfoVar.zze.set(i, zzfsVar);
    }

    static /* synthetic */ void zzo(zzfo zzfoVar, zzfs zzfsVar) {
        zzfsVar.getClass();
        zzfoVar.zzv();
        zzfoVar.zze.add(zzfsVar);
    }

    static /* synthetic */ void zzp(zzfo zzfoVar, Iterable iterable) {
        zzfoVar.zzv();
        zzio.zzbs(iterable, zzfoVar.zze);
    }

    static /* synthetic */ void zzr(zzfo zzfoVar, int i) {
        zzfoVar.zzv();
        zzfoVar.zze.remove(i);
    }

    static /* synthetic */ void zzs(zzfo zzfoVar, String str) {
        str.getClass();
        zzfoVar.zza |= 1;
        zzfoVar.zzf = str;
    }

    static /* synthetic */ void zzt(zzfo zzfoVar, long j) {
        zzfoVar.zza |= 2;
        zzfoVar.zzg = j;
    }

    static /* synthetic */ void zzu(zzfo zzfoVar, long j) {
        zzfoVar.zza |= 4;
        zzfoVar.zzh = j;
    }

    private final void zzv() {
        zzkk<zzfs> zzkkVar = this.zze;
        if (zzkkVar.zza()) {
            return;
        }
        this.zze = zzkd.zzbF(zzkkVar);
    }

    public final List<zzfs> zza() {
        return this.zze;
    }

    public final int zzb() {
        return this.zze.size();
    }

    public final zzfs zzc(int i) {
        return this.zze.get(i);
    }

    public final String zzd() {
        return this.zzf;
    }

    public final boolean zze() {
        return (this.zza & 2) != 0;
    }

    public final long zzf() {
        return this.zzg;
    }

    public final boolean zzg() {
        return (this.zza & 4) != 0;
    }

    public final long zzh() {
        return this.zzh;
    }

    public final boolean zzi() {
        return (this.zza & 8) != 0;
    }

    public final int zzj() {
        return this.zzi;
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
                return zzbz(zzj, "\u0001\u0005\u0000\u0001\u0001\u0005\u0005\u0000\u0001\u0000\u0001\u001b\u0002ဈ\u0000\u0003ဂ\u0001\u0004ဂ\u0002\u0005င\u0003", new Object[]{"zza", "zze", zzfs.class, "zzf", "zzg", "zzh", "zzi"});
            case 3:
                return new zzfo();
            case 4:
                return new zzfn(zzffVar);
            case 5:
                return zzj;
        }
    }
}
