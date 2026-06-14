package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgd extends zzkd<zzgd, zzgc> implements zzlj {
    private static final zzgd zzh;
    private zzkj zza = zzbC();
    private zzkj zze = zzbC();
    private zzkk<zzfm> zzf = zzbE();
    private zzkk<zzgf> zzg = zzbE();

    static {
        zzgd zzgdVar = new zzgd();
        zzh = zzgdVar;
        zzkd.zzby(zzgd.class, zzgdVar);
    }

    private zzgd() {
    }

    public static zzgc zzk() {
        return zzh.zzbt();
    }

    public static zzgd zzm() {
        return zzh;
    }

    static /* synthetic */ void zzo(zzgd zzgdVar, Iterable iterable) {
        zzkj zzkjVar = zzgdVar.zza;
        if (!zzkjVar.zza()) {
            zzgdVar.zza = zzkd.zzbD(zzkjVar);
        }
        zzio.zzbs(iterable, zzgdVar.zza);
    }

    static /* synthetic */ void zzq(zzgd zzgdVar, Iterable iterable) {
        zzkj zzkjVar = zzgdVar.zze;
        if (!zzkjVar.zza()) {
            zzgdVar.zze = zzkd.zzbD(zzkjVar);
        }
        zzio.zzbs(iterable, zzgdVar.zze);
    }

    static /* synthetic */ void zzs(zzgd zzgdVar, Iterable iterable) {
        zzgdVar.zzw();
        zzio.zzbs(iterable, zzgdVar.zzf);
    }

    static /* synthetic */ void zzt(zzgd zzgdVar, int i) {
        zzgdVar.zzw();
        zzgdVar.zzf.remove(i);
    }

    static /* synthetic */ void zzu(zzgd zzgdVar, Iterable iterable) {
        zzgdVar.zzx();
        zzio.zzbs(iterable, zzgdVar.zzg);
    }

    static /* synthetic */ void zzv(zzgd zzgdVar, int i) {
        zzgdVar.zzx();
        zzgdVar.zzg.remove(i);
    }

    private final void zzw() {
        zzkk<zzfm> zzkkVar = this.zzf;
        if (zzkkVar.zza()) {
            return;
        }
        this.zzf = zzkd.zzbF(zzkkVar);
    }

    private final void zzx() {
        zzkk<zzgf> zzkkVar = this.zzg;
        if (zzkkVar.zza()) {
            return;
        }
        this.zzg = zzkd.zzbF(zzkkVar);
    }

    public final List<Long> zza() {
        return this.zza;
    }

    public final int zzb() {
        return this.zza.size();
    }

    public final List<Long> zzc() {
        return this.zze;
    }

    public final int zzd() {
        return this.zze.size();
    }

    public final List<zzfm> zze() {
        return this.zzf;
    }

    public final int zzf() {
        return this.zzf.size();
    }

    public final zzfm zzg(int i) {
        return this.zzf.get(i);
    }

    public final List<zzgf> zzh() {
        return this.zzg;
    }

    public final int zzi() {
        return this.zzg.size();
    }

    public final zzgf zzj(int i) {
        return this.zzg.get(i);
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
                return zzbz(zzh, "\u0001\u0004\u0000\u0000\u0001\u0004\u0004\u0000\u0004\u0000\u0001\u0015\u0002\u0015\u0003\u001b\u0004\u001b", new Object[]{"zza", "zze", "zzf", zzfm.class, "zzg", zzgf.class});
            case 3:
                return new zzgd();
            case 4:
                return new zzgc(zzffVar);
            case 5:
                return zzh;
        }
    }
}
