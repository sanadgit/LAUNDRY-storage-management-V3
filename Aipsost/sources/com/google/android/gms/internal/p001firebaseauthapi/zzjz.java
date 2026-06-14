package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjz extends zzadf implements zzael {
    private static final zzjz zzb;
    private zzkf zzd;
    private zzmw zze;

    static {
        zzjz zzjzVar = new zzjz();
        zzb = zzjzVar;
        zzadf.zzG(zzjz.class, zzjzVar);
    }

    private zzjz() {
    }

    public static zzjy zza() {
        return (zzjy) zzb.zzt();
    }

    public static zzjz zzc(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzjz) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzf(zzjz zzjzVar, zzkf zzkfVar) {
        zzkfVar.getClass();
        zzjzVar.zzd = zzkfVar;
    }

    static /* synthetic */ void zzg(zzjz zzjzVar, zzmw zzmwVar) {
        zzmwVar.getClass();
        zzjzVar.zze = zzmwVar;
    }

    public final zzkf zzd() {
        zzkf zzkfVar = this.zzd;
        return zzkfVar == null ? zzkf.zzd() : zzkfVar;
    }

    public final zzmw zze() {
        zzmw zzmwVar = this.zze;
        return zzmwVar == null ? zzmw.zzd() : zzmwVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzjx zzjxVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\t\u0002\t", new Object[]{"zzd", "zze"});
            case 3:
                return new zzjz();
            case 4:
                return new zzjy(zzjxVar);
            case 5:
                return zzb;
        }
    }
}
