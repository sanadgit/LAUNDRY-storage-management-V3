package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzow extends zzadf implements zzael {
    private static final zzow zzb;
    private String zzd = "";
    private zznx zze;

    static {
        zzow zzowVar = new zzow();
        zzb = zzowVar;
        zzadf.zzG(zzow.class, zzowVar);
    }

    private zzow() {
    }

    public static zzow zzc() {
        return zzb;
    }

    public static zzow zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzow) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final zznx zza() {
        zznx zznxVar = this.zze;
        return zznxVar == null ? zznx.zzc() : zznxVar;
    }

    public final String zze() {
        return this.zzd;
    }

    public final boolean zzf() {
        return this.zze != null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzou zzouVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001Ȉ\u0002\t", new Object[]{"zzd", "zze"});
            case 3:
                return new zzow();
            case 4:
                return new zzov(zzouVar);
            case 5:
                return zzb;
        }
    }
}
