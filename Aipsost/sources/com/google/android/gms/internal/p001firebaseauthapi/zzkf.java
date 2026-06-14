package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkf extends zzadf implements zzael {
    private static final zzkf zzb;
    private zzki zzd;
    private int zze;

    static {
        zzkf zzkfVar = new zzkf();
        zzb = zzkfVar;
        zzadf.zzG(zzkf.class, zzkfVar);
    }

    private zzkf() {
    }

    public static zzke zzb() {
        return (zzke) zzb.zzt();
    }

    public static zzkf zzd() {
        return zzb;
    }

    public static zzkf zze(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzkf) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzg(zzkf zzkfVar, zzki zzkiVar) {
        zzkiVar.getClass();
        zzkfVar.zzd = zzkiVar;
    }

    public final int zza() {
        return this.zze;
    }

    public final zzki zzf() {
        zzki zzkiVar = this.zzd;
        return zzkiVar == null ? zzki.zzd() : zzkiVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzkd zzkdVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\t\u0002\u000b", new Object[]{"zzd", "zze"});
            case 3:
                return new zzkf();
            case 4:
                return new zzke(zzkdVar);
            case 5:
                return zzb;
        }
    }
}
