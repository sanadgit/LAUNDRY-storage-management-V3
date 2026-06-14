package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzmj extends zzadf implements zzael {
    private static final zzmj zzb;
    private int zzd;
    private int zze;
    private zzacc zzf = zzacc.zzb;

    static {
        zzmj zzmjVar = new zzmj();
        zzb = zzmjVar;
        zzadf.zzG(zzmj.class, zzmjVar);
    }

    private zzmj() {
    }

    public static zzmi zza() {
        return (zzmi) zzb.zzt();
    }

    public static zzmj zzc() {
        return zzb;
    }

    public final zzacc zzd() {
        return this.zzf;
    }

    public final int zzf() {
        int i;
        switch (this.zzd) {
            case 0:
                i = 2;
                break;
            case 1:
            default:
                i = 0;
                break;
            case 2:
                i = 4;
                break;
            case 3:
                i = 5;
                break;
            case 4:
                i = 6;
                break;
            case 5:
                i = 7;
                break;
        }
        if (i == 0) {
            return 1;
        }
        return i;
    }

    public final int zzg() {
        int iZzb = zzmq.zzb(this.zze);
        if (iZzb == 0) {
            return 1;
        }
        return iZzb;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzmh zzmhVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u000b\u0003\u0000\u0000\u0000\u0001\f\u0002\f\u000b\n", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zzmj();
            case 4:
                return new zzmi(zzmhVar);
            case 5:
                return zzb;
        }
    }
}
