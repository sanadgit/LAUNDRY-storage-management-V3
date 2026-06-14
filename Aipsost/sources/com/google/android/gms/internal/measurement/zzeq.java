package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzeq extends zzkd<zzeq, zzem> implements zzlj {
    private static final zzeq zzj;
    private int zza;
    private int zze;
    private boolean zzf;
    private String zzg = "";
    private String zzh = "";
    private String zzi = "";

    static {
        zzeq zzeqVar = new zzeq();
        zzj = zzeqVar;
        zzkd.zzby(zzeq.class, zzeqVar);
    }

    private zzeq() {
    }

    public static zzeq zzk() {
        return zzj;
    }

    public final boolean zza() {
        return (this.zza & 1) != 0;
    }

    public final zzep zzb() {
        zzep zzepVarZza = zzep.zza(this.zze);
        return zzepVarZza == null ? zzep.UNKNOWN_COMPARISON_TYPE : zzepVarZza;
    }

    public final boolean zzc() {
        return (this.zza & 2) != 0;
    }

    public final boolean zzd() {
        return this.zzf;
    }

    public final boolean zze() {
        return (this.zza & 4) != 0;
    }

    public final String zzf() {
        return this.zzg;
    }

    public final boolean zzg() {
        return (this.zza & 8) != 0;
    }

    public final String zzh() {
        return this.zzh;
    }

    public final boolean zzi() {
        return (this.zza & 16) != 0;
    }

    public final String zzj() {
        return this.zzi;
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
                return zzbz(zzj, "\u0001\u0005\u0000\u0001\u0001\u0005\u0005\u0000\u0000\u0000\u0001ဌ\u0000\u0002ဇ\u0001\u0003ဈ\u0002\u0004ဈ\u0003\u0005ဈ\u0004", new Object[]{"zza", "zze", zzep.zzb(), "zzf", "zzg", "zzh", "zzi"});
            case 3:
                return new zzeq();
            case 4:
                return new zzem(zzefVar);
            case 5:
                return zzj;
        }
    }
}
