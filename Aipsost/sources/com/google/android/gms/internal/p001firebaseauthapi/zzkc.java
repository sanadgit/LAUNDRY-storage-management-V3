package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkc extends zzadf implements zzael {
    private static final zzkc zzb;
    private int zzd;
    private zzki zze;
    private zzacc zzf = zzacc.zzb;

    static {
        zzkc zzkcVar = new zzkc();
        zzb = zzkcVar;
        zzadf.zzG(zzkc.class, zzkcVar);
    }

    private zzkc() {
    }

    public static zzkb zzb() {
        return (zzkb) zzb.zzt();
    }

    public static zzkc zzd() {
        return zzb;
    }

    public static zzkc zze(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzkc) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzi(zzkc zzkcVar, zzki zzkiVar) {
        zzkiVar.getClass();
        zzkcVar.zze = zzkiVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzki zzf() {
        zzki zzkiVar = this.zze;
        return zzkiVar == null ? zzki.zzd() : zzkiVar;
    }

    public final zzacc zzg() {
        return this.zzf;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzka zzkaVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\u000b\u0002\t\u0003\n", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zzkc();
            case 4:
                return new zzkb(zzkaVar);
            case 5:
                return zzb;
        }
    }
}
