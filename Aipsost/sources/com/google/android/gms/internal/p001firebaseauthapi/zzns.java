package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzns extends zzadf implements zzael {
    private static final zzns zzb;
    private String zzd = "";
    private zzacc zze = zzacc.zzb;
    private int zzf;

    static {
        zzns zznsVar = new zzns();
        zzb = zznsVar;
        zzadf.zzG(zzns.class, zznsVar);
    }

    private zzns() {
    }

    public static zznp zza() {
        return (zznp) zzb.zzt();
    }

    public static zzns zzd() {
        return zzb;
    }

    public final zznr zzb() {
        zznr zznrVarZzb = zznr.zzb(this.zzf);
        return zznrVarZzb == null ? zznr.UNRECOGNIZED : zznrVarZzb;
    }

    public final zzacc zze() {
        return this.zze;
    }

    public final String zzf() {
        return this.zzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzno zznoVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001Ȉ\u0002\n\u0003\f", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zzns();
            case 4:
                return new zznp(zznoVar);
            case 5:
                return zzb;
        }
    }
}
