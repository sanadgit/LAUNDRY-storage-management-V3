package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzoq extends zzadf implements zzael {
    private static final zzoq zzb;
    private String zzd = "";

    static {
        zzoq zzoqVar = new zzoq();
        zzb = zzoqVar;
        zzadf.zzG(zzoq.class, zzoqVar);
    }

    private zzoq() {
    }

    public static zzoq zzb() {
        return zzb;
    }

    public static zzoq zzc(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzoq) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final String zzd() {
        return this.zzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzoo zzooVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0001\u0000\u0000\u0001\u0001\u0001\u0000\u0000\u0000\u0001Ȉ", new Object[]{"zzd"});
            case 3:
                return new zzoq();
            case 4:
                return new zzop(zzooVar);
            case 5:
                return zzb;
        }
    }
}
