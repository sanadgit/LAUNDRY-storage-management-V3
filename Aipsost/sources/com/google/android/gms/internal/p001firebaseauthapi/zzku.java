package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzku extends zzadf implements zzael {
    private static final zzku zzb;
    private int zzd;
    private zzacc zze = zzacc.zzb;

    static {
        zzku zzkuVar = new zzku();
        zzb = zzkuVar;
        zzadf.zzG(zzku.class, zzkuVar);
    }

    private zzku() {
    }

    public static zzkt zzb() {
        return (zzkt) zzb.zzt();
    }

    public static zzku zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzku) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzacc zze() {
        return this.zze;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzks zzksVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0003\u0002\u0000\u0000\u0000\u0001\u000b\u0003\n", new Object[]{"zzd", "zze"});
            case 3:
                return new zzku();
            case 4:
                return new zzkt(zzksVar);
            case 5:
                return zzb;
        }
    }
}
