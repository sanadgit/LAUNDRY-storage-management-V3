package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzlx extends zzadf implements zzael {
    private static final zzlx zzb;
    private zzma zzd;

    static {
        zzlx zzlxVar = new zzlx();
        zzb = zzlxVar;
        zzadf.zzG(zzlx.class, zzlxVar);
    }

    private zzlx() {
    }

    public static zzlw zza() {
        return (zzlw) zzb.zzt();
    }

    public static zzlx zzc(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzlx) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zze(zzlx zzlxVar, zzma zzmaVar) {
        zzmaVar.getClass();
        zzlxVar.zzd = zzmaVar;
    }

    public final zzma zzd() {
        zzma zzmaVar = this.zzd;
        return zzmaVar == null ? zzma.zzd() : zzmaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzlv zzlvVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0001\u0000\u0000\u0001\u0001\u0001\u0000\u0000\u0000\u0001\t", new Object[]{"zzd"});
            case 3:
                return new zzlx();
            case 4:
                return new zzlw(zzlvVar);
            case 5:
                return zzb;
        }
    }
}
