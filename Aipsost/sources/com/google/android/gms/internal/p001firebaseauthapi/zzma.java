package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzma extends zzadf implements zzael {
    private static final zzma zzb;
    private zzmj zzd;
    private zzlu zze;
    private int zzf;

    static {
        zzma zzmaVar = new zzma();
        zzb = zzmaVar;
        zzadf.zzG(zzma.class, zzmaVar);
    }

    private zzma() {
    }

    public static zzlz zzb() {
        return (zzlz) zzb.zzt();
    }

    public static zzma zzd() {
        return zzb;
    }

    static /* synthetic */ void zzf(zzma zzmaVar, zzmj zzmjVar) {
        zzmjVar.getClass();
        zzmaVar.zzd = zzmjVar;
    }

    static /* synthetic */ void zzg(zzma zzmaVar, zzlu zzluVar) {
        zzluVar.getClass();
        zzmaVar.zze = zzluVar;
    }

    public final zzlu zza() {
        zzlu zzluVar = this.zze;
        return zzluVar == null ? zzlu.zzc() : zzluVar;
    }

    public final zzmj zze() {
        zzmj zzmjVar = this.zzd;
        return zzmjVar == null ? zzmj.zzc() : zzmjVar;
    }

    public final int zzh() {
        int i;
        switch (this.zzf) {
            case 0:
                i = 2;
                break;
            case 1:
                i = 3;
                break;
            case 2:
                i = 4;
                break;
            case 3:
                i = 5;
                break;
            default:
                i = 0;
                break;
        }
        if (i == 0) {
            return 1;
        }
        return i;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzly zzlyVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\t\u0002\t\u0003\f", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zzma();
            case 4:
                return new zzlz(zzlyVar);
            case 5:
                return zzb;
        }
    }
}
