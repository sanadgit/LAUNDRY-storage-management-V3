package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgo extends zzkd<zzgo, zzgn> implements zzlj {
    private static final zzgo zzg;
    private int zza;
    private zzkk<zzgt> zze = zzbE();
    private zzgk zzf;

    static {
        zzgo zzgoVar = new zzgo();
        zzg = zzgoVar;
        zzkd.zzby(zzgo.class, zzgoVar);
    }

    private zzgo() {
    }

    public final List<zzgt> zza() {
        return this.zze;
    }

    public final zzgk zzb() {
        zzgk zzgkVar = this.zzf;
        return zzgkVar == null ? zzgk.zzc() : zzgkVar;
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
                return zzbz(zzg, "\u0001\u0002\u0000\u0001\u0001\u0002\u0002\u0000\u0001\u0000\u0001\u001b\u0002ဉ\u0000", new Object[]{"zza", "zze", zzgt.class, "zzf"});
            case 3:
                return new zzgo();
            case 4:
                return new zzgn(zzgiVar);
            case 5:
                return zzg;
        }
    }
}
