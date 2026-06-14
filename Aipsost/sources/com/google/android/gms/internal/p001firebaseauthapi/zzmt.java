package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzmt extends zzadf implements zzael {
    private static final zzmt zzb;
    private int zzd;
    private zzmz zze;
    private zzacc zzf = zzacc.zzb;

    static {
        zzmt zzmtVar = new zzmt();
        zzb = zzmtVar;
        zzadf.zzG(zzmt.class, zzmtVar);
    }

    private zzmt() {
    }

    public static zzms zzb() {
        return (zzms) zzb.zzt();
    }

    public static zzmt zzd() {
        return zzb;
    }

    public static zzmt zze(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzmt) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzi(zzmt zzmtVar, zzmz zzmzVar) {
        zzmzVar.getClass();
        zzmtVar.zze = zzmzVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzmz zzf() {
        zzmz zzmzVar = this.zze;
        return zzmzVar == null ? zzmz.zzd() : zzmzVar;
    }

    public final zzacc zzg() {
        return this.zzf;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzmr zzmrVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\u000b\u0002\t\u0003\n", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zzmt();
            case 4:
                return new zzms(zzmrVar);
            case 5:
                return zzb;
        }
    }
}
