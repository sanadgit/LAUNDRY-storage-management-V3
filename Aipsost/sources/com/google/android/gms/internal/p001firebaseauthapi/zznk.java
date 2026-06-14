package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zznk extends zzadf implements zzael {
    private static final zznk zzb;
    private int zzd;
    private zznn zze;
    private zzacc zzf = zzacc.zzb;

    static {
        zznk zznkVar = new zznk();
        zzb = zznkVar;
        zzadf.zzG(zznk.class, zznkVar);
    }

    private zznk() {
    }

    public static zznj zzb() {
        return (zznj) zzb.zzt();
    }

    public static zznk zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zznk) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzh(zznk zznkVar, zznn zznnVar) {
        zznnVar.getClass();
        zznkVar.zze = zznnVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zznn zze() {
        zznn zznnVar = this.zze;
        return zznnVar == null ? zznn.zze() : zznnVar;
    }

    public final zzacc zzf() {
        return this.zzf;
    }

    public final boolean zzk() {
        return this.zze != null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzni zzniVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\u000b\u0002\t\u0003\n", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zznk();
            case 4:
                return new zznj(zzniVar);
            case 5:
                return zzb;
        }
    }
}
