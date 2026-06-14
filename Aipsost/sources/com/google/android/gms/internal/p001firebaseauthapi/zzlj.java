package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzlj extends zzadf implements zzael {
    private static final zzlj zzb;
    private int zzd;
    private int zze;

    static {
        zzlj zzljVar = new zzlj();
        zzb = zzljVar;
        zzadf.zzG(zzlj.class, zzljVar);
    }

    private zzlj() {
    }

    public static zzli zzb() {
        return (zzli) zzb.zzt();
    }

    public static zzlj zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzlj) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final int zza() {
        return this.zzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzlh zzlhVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\u000b\u0002\u000b", new Object[]{"zzd", "zze"});
            case 3:
                return new zzlj();
            case 4:
                return new zzli(zzlhVar);
            case 5:
                return zzb;
        }
    }
}
