package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgm extends zzkd<zzgm, zzgl> implements zzlj {
    private static final zzgm zzg;
    private int zza;
    private String zze = "";
    private zzkk<zzgt> zzf = zzbE();

    static {
        zzgm zzgmVar = new zzgm();
        zzg = zzgmVar;
        zzkd.zzby(zzgm.class, zzgmVar);
    }

    private zzgm() {
    }

    public final String zza() {
        return this.zze;
    }

    public final List<zzgt> zzb() {
        return this.zzf;
    }

    @Override // com.google.android.gms.internal.measurement.zzkd
    protected final Object zzl(int i, Object obj, Object obj2) {
        zzgi zzgiVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzbz(zzg, "\u0001\u0002\u0000\u0001\u0001\u0002\u0002\u0000\u0001\u0000\u0001ဈ\u0000\u0002\u001b", new Object[]{"zza", "zze", "zzf", zzgt.class});
            case 3:
                return new zzgm();
            case 4:
                return new zzgl(zzgiVar);
            case 5:
                return zzg;
        }
    }
}
