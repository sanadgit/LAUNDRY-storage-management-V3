package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zznx extends zzadf implements zzael {
    private static final zznx zzb;
    private String zzd = "";
    private zzacc zze = zzacc.zzb;
    private int zzf;

    static {
        zznx zznxVar = new zznx();
        zzb = zznxVar;
        zzadf.zzG(zznx.class, zznxVar);
    }

    private zznx() {
    }

    public static zznw zza() {
        return (zznw) zzb.zzt();
    }

    public static zznx zzc() {
        return zzb;
    }

    static /* synthetic */ void zzg(zznx zznxVar, String str) {
        str.getClass();
        zznxVar.zzd = str;
    }

    public final zzoy zzd() {
        zzoy zzoyVarZzb = zzoy.zzb(this.zzf);
        return zzoyVarZzb == null ? zzoy.UNRECOGNIZED : zzoyVarZzb;
    }

    public final zzacc zze() {
        return this.zze;
    }

    public final String zzf() {
        return this.zzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zznv zznvVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001Ȉ\u0002\n\u0003\f", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zznx();
            case 4:
                return new zznw(zznvVar);
            case 5:
                return zzb;
        }
    }
}
