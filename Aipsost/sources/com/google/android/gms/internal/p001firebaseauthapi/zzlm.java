package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzlm extends zzadf implements zzael {
    private static final zzlm zzb;
    private int zzd;
    private zzacc zze = zzacc.zzb;

    static {
        zzlm zzlmVar = new zzlm();
        zzb = zzlmVar;
        zzadf.zzG(zzlm.class, zzlmVar);
    }

    private zzlm() {
    }

    public static zzll zzb() {
        return (zzll) zzb.zzt();
    }

    public static zzlm zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzlm) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzacc zze() {
        return this.zze;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzlk zzlkVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\u000b\u0002\n", new Object[]{"zzd", "zze"});
            case 3:
                return new zzlm();
            case 4:
                return new zzll(zzlkVar);
            case 5:
                return zzb;
        }
    }
}
