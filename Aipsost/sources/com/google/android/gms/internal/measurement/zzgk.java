package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgk extends zzkd<zzgk, zzgj> implements zzlj {
    private static final zzgk zze;
    private zzkk<zzgm> zza = zzbE();

    static {
        zzgk zzgkVar = new zzgk();
        zze = zzgkVar;
        zzkd.zzby(zzgk.class, zzgkVar);
    }

    private zzgk() {
    }

    public static zzgk zzc() {
        return zze;
    }

    public final List<zzgm> zza() {
        return this.zza;
    }

    public final int zzb() {
        return this.zza.size();
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
                return zzbz(zze, "\u0001\u0001\u0000\u0000\u0001\u0001\u0001\u0000\u0001\u0000\u0001\u001b", new Object[]{"zza", zzgm.class});
            case 3:
                return new zzgk();
            case 4:
                return new zzgj(zzgiVar);
            case 5:
                return zze;
        }
    }
}
