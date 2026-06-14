package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
@Deprecated
public final class zzpb extends zzadf implements zzael {
    private static final zzpb zzb;
    private String zzd = "";
    private zzadk zze = zzz();

    static {
        zzpb zzpbVar = new zzpb();
        zzb = zzpbVar;
        zzadf.zzG(zzpb.class, zzpbVar);
    }

    private zzpb() {
    }

    public static zzpb zzb() {
        return zzb;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzoz zzozVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0001\u0000\u0001Ȉ\u0002\u001b", new Object[]{"zzd", "zze", zzoa.class});
            case 3:
                return new zzpb();
            case 4:
                return new zzpa(zzozVar);
            case 5:
                return zzb;
        }
    }
}
