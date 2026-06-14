package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzon extends zzadf implements zzael {
    private static final zzon zzb;
    private int zzd;
    private zzoq zze;

    static {
        zzon zzonVar = new zzon();
        zzb = zzonVar;
        zzadf.zzG(zzon.class, zzonVar);
    }

    private zzon() {
    }

    public static zzom zzb() {
        return (zzom) zzb.zzt();
    }

    public static zzon zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzon) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzg(zzon zzonVar, zzoq zzoqVar) {
        zzoqVar.getClass();
        zzonVar.zze = zzoqVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzoq zze() {
        zzoq zzoqVar = this.zze;
        return zzoqVar == null ? zzoq.zzb() : zzoqVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzol zzolVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\u000b\u0002\t", new Object[]{"zzd", "zze"});
            case 3:
                return new zzon();
            case 4:
                return new zzom(zzolVar);
            case 5:
                return zzb;
        }
    }
}
