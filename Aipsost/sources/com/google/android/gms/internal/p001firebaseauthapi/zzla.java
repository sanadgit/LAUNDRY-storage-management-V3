package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzla extends zzadf implements zzael {
    private static final zzla zzb;
    private int zzd;
    private zzacc zze = zzacc.zzb;

    static {
        zzla zzlaVar = new zzla();
        zzb = zzlaVar;
        zzadf.zzG(zzla.class, zzlaVar);
    }

    private zzla() {
    }

    public static zzkz zzb() {
        return (zzkz) zzb.zzt();
    }

    public static zzla zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzla) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzacc zze() {
        return this.zze;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzky zzkyVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0003\u0002\u0000\u0000\u0000\u0001\u000b\u0003\n", new Object[]{"zzd", "zze"});
            case 3:
                return new zzla();
            case 4:
                return new zzkz(zzkyVar);
            case 5:
                return zzb;
        }
    }
}
