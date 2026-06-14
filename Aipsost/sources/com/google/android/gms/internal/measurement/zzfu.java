package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfu extends zzkd<zzfu, zzft> implements zzlj {
    private static final zzfu zze;
    private zzkk<zzfw> zza = zzbE();

    static {
        zzfu zzfuVar = new zzfu();
        zze = zzfuVar;
        zzkd.zzby(zzfu.class, zzfuVar);
    }

    private zzfu() {
    }

    public static zzft zzc() {
        return zze.zzbt();
    }

    static /* synthetic */ void zze(zzfu zzfuVar, zzfw zzfwVar) {
        zzfwVar.getClass();
        zzkk<zzfw> zzkkVar = zzfuVar.zza;
        if (!zzkkVar.zza()) {
            zzfuVar.zza = zzkd.zzbF(zzkkVar);
        }
        zzfuVar.zza.add(zzfwVar);
    }

    public final List<zzfw> zza() {
        return this.zza;
    }

    public final zzfw zzb(int i) {
        return this.zza.get(0);
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
                return zzbz(zze, "\u0001\u0001\u0000\u0000\u0001\u0001\u0001\u0000\u0001\u0000\u0001\u001b", new Object[]{"zza", zzfw.class});
            case 3:
                return new zzfu();
            case 4:
                return new zzft(zzffVar);
            case 5:
                return zze;
        }
    }
}
