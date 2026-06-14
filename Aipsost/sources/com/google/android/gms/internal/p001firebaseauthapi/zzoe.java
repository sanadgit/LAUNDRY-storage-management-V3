package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzoe extends zzadf implements zzael {
    private static final zzoe zzb;
    private zzns zzd;
    private int zze;
    private int zzf;
    private int zzg;

    static {
        zzoe zzoeVar = new zzoe();
        zzb = zzoeVar;
        zzadf.zzG(zzoe.class, zzoeVar);
    }

    private zzoe() {
    }

    public static zzod zzc() {
        return (zzod) zzb.zzt();
    }

    static /* synthetic */ void zzf(zzoe zzoeVar, zzns zznsVar) {
        zznsVar.getClass();
        zzoeVar.zzd = zznsVar;
    }

    public final int zza() {
        return this.zzf;
    }

    public final zzns zzb() {
        zzns zznsVar = this.zzd;
        return zznsVar == null ? zzns.zzd() : zznsVar;
    }

    public final zzoy zze() {
        zzoy zzoyVarZzb = zzoy.zzb(this.zzg);
        return zzoyVarZzb == null ? zzoy.UNRECOGNIZED : zzoyVarZzb;
    }

    public final boolean zzi() {
        return this.zzd != null;
    }

    public final int zzk() {
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

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzob zzobVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0004\u0000\u0000\u0001\u0004\u0004\u0000\u0000\u0000\u0001\t\u0002\f\u0003\u000b\u0004\f", new Object[]{"zzd", "zze", "zzf", "zzg"});
            case 3:
                return new zzoe();
            case 4:
                return new zzod(zzobVar);
            case 5:
                return zzb;
        }
    }
}
