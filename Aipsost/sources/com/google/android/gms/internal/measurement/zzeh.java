package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzeh extends zzkd<zzeh, zzeg> implements zzlj {
    private static final zzeh zzj;
    private int zza;
    private int zze;
    private zzkk<zzes> zzf = zzbE();
    private zzkk<zzej> zzg = zzbE();
    private boolean zzh;
    private boolean zzi;

    static {
        zzeh zzehVar = new zzeh();
        zzj = zzehVar;
        zzkd.zzby(zzeh.class, zzehVar);
    }

    private zzeh() {
    }

    static /* synthetic */ void zzj(zzeh zzehVar, int i, zzes zzesVar) {
        zzesVar.getClass();
        zzkk<zzes> zzkkVar = zzehVar.zzf;
        if (!zzkkVar.zza()) {
            zzehVar.zzf = zzkd.zzbF(zzkkVar);
        }
        zzehVar.zzf.set(i, zzesVar);
    }

    static /* synthetic */ void zzk(zzeh zzehVar, int i, zzej zzejVar) {
        zzejVar.getClass();
        zzkk<zzej> zzkkVar = zzehVar.zzg;
        if (!zzkkVar.zza()) {
            zzehVar.zzg = zzkd.zzbF(zzkkVar);
        }
        zzehVar.zzg.set(i, zzejVar);
    }

    public final boolean zza() {
        return (this.zza & 1) != 0;
    }

    public final int zzb() {
        return this.zze;
    }

    public final List<zzes> zzc() {
        return this.zzf;
    }

    public final int zzd() {
        return this.zzf.size();
    }

    public final zzes zze(int i) {
        return this.zzf.get(i);
    }

    public final List<zzej> zzf() {
        return this.zzg;
    }

    public final int zzg() {
        return this.zzg.size();
    }

    public final zzej zzh(int i) {
        return this.zzg.get(i);
    }

    @Override // com.google.android.gms.internal.measurement.zzkd
    protected final Object zzl(int i, Object obj, Object obj2) {
        zzef zzefVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzbz(zzj, "\u0001\u0005\u0000\u0001\u0001\u0005\u0005\u0000\u0002\u0000\u0001င\u0000\u0002\u001b\u0003\u001b\u0004ဇ\u0001\u0005ဇ\u0002", new Object[]{"zza", "zze", "zzf", zzes.class, "zzg", zzej.class, "zzh", "zzi"});
            case 3:
                return new zzeh();
            case 4:
                return new zzeg(zzefVar);
            case 5:
                return zzj;
        }
    }
}
