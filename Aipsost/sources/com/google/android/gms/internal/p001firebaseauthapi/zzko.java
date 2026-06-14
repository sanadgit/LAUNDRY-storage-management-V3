package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzko extends zzadf implements zzael {
    private static final zzko zzb;
    private zzkr zzd;
    private int zze;

    static {
        zzko zzkoVar = new zzko();
        zzb = zzkoVar;
        zzadf.zzG(zzko.class, zzkoVar);
    }

    private zzko() {
    }

    public static zzkn zzb() {
        return (zzkn) zzb.zzt();
    }

    public static zzko zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzko) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzf(zzko zzkoVar, zzkr zzkrVar) {
        zzkrVar.getClass();
        zzkoVar.zzd = zzkrVar;
    }

    public final int zza() {
        return this.zze;
    }

    public final zzkr zze() {
        zzkr zzkrVar = this.zzd;
        return zzkrVar == null ? zzkr.zzd() : zzkrVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzkm zzkmVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\t\u0002\u000b", new Object[]{"zzd", "zze"});
            case 3:
                return new zzko();
            case 4:
                return new zzkn(zzkmVar);
            case 5:
                return zzb;
        }
    }
}
