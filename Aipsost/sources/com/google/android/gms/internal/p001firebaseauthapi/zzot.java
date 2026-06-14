package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzot extends zzadf implements zzael {
    private static final zzot zzb;
    private int zzd;
    private zzow zze;

    static {
        zzot zzotVar = new zzot();
        zzb = zzotVar;
        zzadf.zzG(zzot.class, zzotVar);
    }

    private zzot() {
    }

    public static zzos zzb() {
        return (zzos) zzb.zzt();
    }

    public static zzot zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzot) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzg(zzot zzotVar, zzow zzowVar) {
        zzowVar.getClass();
        zzotVar.zze = zzowVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzow zze() {
        zzow zzowVar = this.zze;
        return zzowVar == null ? zzow.zzc() : zzowVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzor zzorVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\u000b\u0002\t", new Object[]{"zzd", "zze"});
            case 3:
                return new zzot();
            case 4:
                return new zzos(zzorVar);
            case 5:
                return zzb;
        }
    }
}
