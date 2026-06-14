package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzlg extends zzadf implements zzael {
    private static final zzlg zzb;
    private int zzd;
    private zzacc zze = zzacc.zzb;

    static {
        zzlg zzlgVar = new zzlg();
        zzb = zzlgVar;
        zzadf.zzG(zzlg.class, zzlgVar);
    }

    private zzlg() {
    }

    public static zzlf zzb() {
        return (zzlf) zzb.zzt();
    }

    public static zzlg zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzlg) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzacc zze() {
        return this.zze;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzle zzleVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\u000b\u0002\n", new Object[]{"zzd", "zze"});
            case 3:
                return new zzlg();
            case 4:
                return new zzlf(zzleVar);
            case 5:
                return zzb;
        }
    }
}
