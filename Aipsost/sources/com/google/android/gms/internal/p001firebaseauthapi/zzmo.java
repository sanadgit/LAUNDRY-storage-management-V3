package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzmo extends zzadf implements zzael {
    private static final zzmo zzb;
    private zzacc zzd = zzacc.zzb;
    private zzok zze;

    static {
        zzmo zzmoVar = new zzmo();
        zzb = zzmoVar;
        zzadf.zzG(zzmo.class, zzmoVar);
    }

    private zzmo() {
    }

    public static zzmn zza() {
        return (zzmn) zzb.zzt();
    }

    public static zzmo zzc(byte[] bArr, zzacs zzacsVar) throws zzadn {
        return (zzmo) zzadf.zzy(zzb, bArr, zzacsVar);
    }

    static /* synthetic */ void zzf(zzmo zzmoVar, zzok zzokVar) {
        zzokVar.getClass();
        zzmoVar.zze = zzokVar;
    }

    public final zzacc zzd() {
        return this.zzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzmm zzmmVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0002\u0003\u0002\u0000\u0000\u0000\u0002\n\u0003\t", new Object[]{"zzd", "zze"});
            case 3:
                return new zzmo();
            case 4:
                return new zzmn(zzmmVar);
            case 5:
                return zzb;
        }
    }
}
