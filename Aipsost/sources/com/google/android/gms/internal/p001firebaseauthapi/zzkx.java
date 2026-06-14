package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkx extends zzadf implements zzael {
    private static final zzkx zzb;
    private int zzd;
    private int zze;

    static {
        zzkx zzkxVar = new zzkx();
        zzb = zzkxVar;
        zzadf.zzG(zzkx.class, zzkxVar);
    }

    private zzkx() {
    }

    public static zzkw zzb() {
        return (zzkw) zzb.zzt();
    }

    public static zzkx zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzkx) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final int zza() {
        return this.zzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzkv zzkvVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0002\u0003\u0002\u0000\u0000\u0000\u0002\u000b\u0003\u000b", new Object[]{"zzd", "zze"});
            case 3:
                return new zzkx();
            case 4:
                return new zzkw(zzkvVar);
            case 5:
                return zzb;
        }
    }
}
