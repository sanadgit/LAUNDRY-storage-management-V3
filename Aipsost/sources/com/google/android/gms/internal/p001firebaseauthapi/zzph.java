package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzph extends zzadf implements zzael {
    private static final zzph zzb;
    private int zzd;

    static {
        zzph zzphVar = new zzph();
        zzb = zzphVar;
        zzadf.zzG(zzph.class, zzphVar);
    }

    private zzph() {
    }

    public static zzph zzb() {
        return zzb;
    }

    public static zzph zzc(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzph) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzpf zzpfVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0001\u0000\u0000\u0001\u0001\u0001\u0000\u0000\u0000\u0001\u000b", new Object[]{"zzd"});
            case 3:
                return new zzph();
            case 4:
                return new zzpg(zzpfVar);
            case 5:
                return zzb;
        }
    }
}
