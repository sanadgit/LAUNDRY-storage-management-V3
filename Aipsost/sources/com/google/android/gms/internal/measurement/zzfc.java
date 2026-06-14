package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfc extends zzkd<zzfc, zzfb> implements zzlj {
    private static final zzfc zzn;
    private int zza;
    private long zze;
    private int zzg;
    private boolean zzl;
    private String zzf = "";
    private zzkk<zzfe> zzh = zzbE();
    private zzkk<zzfa> zzi = zzbE();
    private zzkk<zzeh> zzj = zzbE();
    private String zzk = "";
    private zzkk<zzgo> zzm = zzbE();

    static {
        zzfc zzfcVar = new zzfc();
        zzn = zzfcVar;
        zzkd.zzby(zzfc.class, zzfcVar);
    }

    private zzfc() {
    }

    public static zzfb zzm() {
        return zzn.zzbt();
    }

    public static zzfc zzn() {
        return zzn;
    }

    static /* synthetic */ void zzp(zzfc zzfcVar, int i, zzfa zzfaVar) {
        zzfaVar.getClass();
        zzkk<zzfa> zzkkVar = zzfcVar.zzi;
        if (!zzkkVar.zza()) {
            zzfcVar.zzi = zzkd.zzbF(zzkkVar);
        }
        zzfcVar.zzi.set(i, zzfaVar);
    }

    public final boolean zza() {
        return (this.zza & 1) != 0;
    }

    public final long zzb() {
        return this.zze;
    }

    public final boolean zzc() {
        return (this.zza & 2) != 0;
    }

    public final String zzd() {
        return this.zzf;
    }

    public final List<zzfe> zze() {
        return this.zzh;
    }

    public final int zzf() {
        return this.zzi.size();
    }

    public final zzfa zzg(int i) {
        return this.zzi.get(i);
    }

    public final List<zzeh> zzh() {
        return this.zzj;
    }

    public final boolean zzi() {
        return this.zzl;
    }

    public final List<zzgo> zzj() {
        return this.zzm;
    }

    public final int zzk() {
        return this.zzm.size();
    }

    @Override // com.google.android.gms.internal.measurement.zzkd
    protected final Object zzl(int i, Object obj, Object obj2) {
        zzey zzeyVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzbz(zzn, "\u0001\t\u0000\u0001\u0001\t\t\u0000\u0004\u0000\u0001ဂ\u0000\u0002ဈ\u0001\u0003င\u0002\u0004\u001b\u0005\u001b\u0006\u001b\u0007ဈ\u0003\bဇ\u0004\t\u001b", new Object[]{"zza", "zze", "zzf", "zzg", "zzh", zzfe.class, "zzi", zzfa.class, "zzj", zzeh.class, "zzk", "zzl", "zzm", zzgo.class});
            case 3:
                return new zzfc();
            case 4:
                return new zzfb(zzeyVar);
            case 5:
                return zzn;
        }
    }
}
