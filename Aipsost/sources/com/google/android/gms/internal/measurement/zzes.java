package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzes extends zzkd<zzes, zzer> implements zzlj {
    private static final zzes zzk;
    private int zza;
    private int zze;
    private String zzf = "";
    private zzel zzg;
    private boolean zzh;
    private boolean zzi;
    private boolean zzj;

    static {
        zzes zzesVar = new zzes();
        zzk = zzesVar;
        zzkd.zzby(zzes.class, zzesVar);
    }

    private zzes() {
    }

    public static zzer zzi() {
        return zzk.zzbt();
    }

    static /* synthetic */ void zzk(zzes zzesVar, String str) {
        zzesVar.zza |= 2;
        zzesVar.zzf = str;
    }

    public final boolean zza() {
        return (this.zza & 1) != 0;
    }

    public final int zzb() {
        return this.zze;
    }

    public final String zzc() {
        return this.zzf;
    }

    public final zzel zzd() {
        zzel zzelVar = this.zzg;
        return zzelVar == null ? zzel.zzi() : zzelVar;
    }

    public final boolean zze() {
        return this.zzh;
    }

    public final boolean zzf() {
        return this.zzi;
    }

    public final boolean zzg() {
        return (this.zza & 32) != 0;
    }

    public final boolean zzh() {
        return this.zzj;
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
                return zzbz(zzk, "\u0001\u0006\u0000\u0001\u0001\u0006\u0006\u0000\u0000\u0000\u0001င\u0000\u0002ဈ\u0001\u0003ဉ\u0002\u0004ဇ\u0003\u0005ဇ\u0004\u0006ဇ\u0005", new Object[]{"zza", "zze", "zzf", "zzg", "zzh", "zzi", "zzj"});
            case 3:
                return new zzes();
            case 4:
                return new zzer(zzefVar);
            case 5:
                return zzk;
        }
    }
}
