package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzmz extends zzadf implements zzael {
    private static final zzmz zzb;
    private int zzd;
    private int zze;

    static {
        zzmz zzmzVar = new zzmz();
        zzb = zzmzVar;
        zzadf.zzG(zzmz.class, zzmzVar);
    }

    private zzmz() {
    }

    public static zzmy zzb() {
        return (zzmy) zzb.zzt();
    }

    public static zzmz zzd() {
        return zzb;
    }

    public final int zza() {
        return this.zze;
    }

    public final int zzf() {
        int iZzb = zzmq.zzb(this.zzd);
        if (iZzb == 0) {
            return 1;
        }
        return iZzb;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzmx zzmxVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\f\u0002\u000b", new Object[]{"zzd", "zze"});
            case 3:
                return new zzmz();
            case 4:
                return new zzmy(zzmxVar);
            case 5:
                return zzb;
        }
    }
}
