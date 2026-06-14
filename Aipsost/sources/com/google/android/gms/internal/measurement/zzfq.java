package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfq extends zzkd<zzfq, zzfp> implements zzlj {
    private static final zzfq zzg;
    private int zza;
    private String zze = "";
    private long zzf;

    static {
        zzfq zzfqVar = new zzfq();
        zzg = zzfqVar;
        zzkd.zzby(zzfq.class, zzfqVar);
    }

    private zzfq() {
    }

    public static zzfp zza() {
        return zzg.zzbt();
    }

    static /* synthetic */ void zzc(zzfq zzfqVar, String str) {
        str.getClass();
        zzfqVar.zza |= 1;
        zzfqVar.zze = str;
    }

    static /* synthetic */ void zzd(zzfq zzfqVar, long j) {
        zzfqVar.zza |= 2;
        zzfqVar.zzf = j;
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
                return zzbz(zzg, "\u0001\u0002\u0000\u0001\u0001\u0002\u0002\u0000\u0000\u0000\u0001ဈ\u0000\u0002ဂ\u0001", new Object[]{"zza", "zze", "zzf"});
            case 3:
                return new zzfq();
            case 4:
                return new zzfp(zzffVar);
            case 5:
                return zzg;
        }
    }
}
