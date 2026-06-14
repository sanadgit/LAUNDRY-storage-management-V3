package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zznh extends zzadf implements zzael {
    private static final zznh zzb;
    private int zzd;
    private int zze;
    private int zzf;

    static {
        zznh zznhVar = new zznh();
        zzb = zznhVar;
        zzadf.zzG(zznh.class, zznhVar);
    }

    private zznh() {
    }

    public static zzng zza() {
        return (zzng) zzb.zzt();
    }

    public static zznh zzc() {
        return zzb;
    }

    public final int zzd() {
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

    public final int zze() {
        int i;
        switch (this.zze) {
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

    public final int zzf() {
        int i;
        switch (this.zzd) {
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
            case 4:
                i = 6;
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
        zznf zznfVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\f\u0002\f\u0003\f", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zznh();
            case 4:
                return new zzng(zznfVar);
            case 5:
                return zzb;
        }
    }
}
