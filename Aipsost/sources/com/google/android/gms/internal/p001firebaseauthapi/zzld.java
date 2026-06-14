package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzld extends zzadf implements zzael {
    private static final zzld zzb;
    private int zzd;
    private int zze;

    static {
        zzld zzldVar = new zzld();
        zzb = zzldVar;
        zzadf.zzG(zzld.class, zzldVar);
    }

    private zzld() {
    }

    public static zzlc zzb() {
        return (zzlc) zzb.zzt();
    }

    public static zzld zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzld) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final int zza() {
        return this.zzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzlb zzlbVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\u000b\u0002\u000b", new Object[]{"zze", "zzd"});
            case 3:
                return new zzld();
            case 4:
                return new zzlc(zzlbVar);
            case 5:
                return zzb;
        }
    }
}
