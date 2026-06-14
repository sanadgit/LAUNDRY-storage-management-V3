package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzmg extends zzadf implements zzael {
    private static final zzmg zzb;
    private int zzd;
    private zzma zze;
    private zzacc zzf = zzacc.zzb;
    private zzacc zzg = zzacc.zzb;

    static {
        zzmg zzmgVar = new zzmg();
        zzb = zzmgVar;
        zzadf.zzG(zzmg.class, zzmgVar);
    }

    private zzmg() {
    }

    public static zzmf zzc() {
        return (zzmf) zzb.zzt();
    }

    public static zzmg zze() {
        return zzb;
    }

    public static zzmg zzf(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzmg) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzk(zzmg zzmgVar, zzma zzmaVar) {
        zzmaVar.getClass();
        zzmgVar.zze = zzmaVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzma zzb() {
        zzma zzmaVar = this.zze;
        return zzmaVar == null ? zzma.zzd() : zzmaVar;
    }

    public final zzacc zzg() {
        return this.zzf;
    }

    public final zzacc zzh() {
        return this.zzg;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzme zzmeVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0004\u0000\u0000\u0001\u0004\u0004\u0000\u0000\u0000\u0001\u000b\u0002\t\u0003\n\u0004\n", new Object[]{"zzd", "zze", "zzf", "zzg"});
            case 3:
                return new zzmg();
            case 4:
                return new zzmf(zzmeVar);
            case 5:
                return zzb;
        }
    }
}
