package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzlp extends zzadf implements zzael {
    private static final zzlp zzb;

    static {
        zzlp zzlpVar = new zzlp();
        zzb = zzlpVar;
        zzadf.zzG(zzlp.class, zzlpVar);
    }

    private zzlp() {
    }

    public static zzlp zzb() {
        return zzb;
    }

    public static zzlp zzc(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzlp) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzln zzlnVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0000", null);
            case 3:
                return new zzlp();
            case 4:
                return new zzlo(zzlnVar);
            case 5:
                return zzb;
        }
    }
}
