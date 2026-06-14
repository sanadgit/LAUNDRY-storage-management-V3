package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkl extends zzadf implements zzael {
    private static final zzkl zzb;
    private int zzd;
    private zzkr zze;
    private zzacc zzf = zzacc.zzb;

    static {
        zzkl zzklVar = new zzkl();
        zzb = zzklVar;
        zzadf.zzG(zzkl.class, zzklVar);
    }

    private zzkl() {
    }

    public static zzkk zzb() {
        return (zzkk) zzb.zzt();
    }

    public static zzkl zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzkl) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzh(zzkl zzklVar, zzkr zzkrVar) {
        zzkrVar.getClass();
        zzklVar.zze = zzkrVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzkr zze() {
        zzkr zzkrVar = this.zze;
        return zzkrVar == null ? zzkr.zzd() : zzkrVar;
    }

    public final zzacc zzf() {
        return this.zzf;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzkj zzkjVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\u000b\u0002\t\u0003\n", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zzkl();
            case 4:
                return new zzkk(zzkjVar);
            case 5:
                return zzb;
        }
    }
}
