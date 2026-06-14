package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zznn extends zzadf implements zzael {
    private static final zznn zzb;
    private int zzd;
    private zznh zze;
    private zzacc zzf = zzacc.zzb;

    static {
        zznn zznnVar = new zznn();
        zzb = zznnVar;
        zzadf.zzG(zznn.class, zznnVar);
    }

    private zznn() {
    }

    public static zznm zzc() {
        return (zznm) zzb.zzt();
    }

    public static zznn zze() {
        return zzb;
    }

    public static zznn zzf(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zznn) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzi(zznn zznnVar, zznh zznhVar) {
        zznhVar.getClass();
        zznnVar.zze = zznhVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zznh zzb() {
        zznh zznhVar = this.zze;
        return zznhVar == null ? zznh.zzc() : zznhVar;
    }

    public final zzacc zzg() {
        return this.zzf;
    }

    public final boolean zzl() {
        return this.zze != null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zznl zznlVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\u000b\u0002\t\u0003\n", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zznn();
            case 4:
                return new zznm(zznlVar);
            case 5:
                return zzb;
        }
    }
}
