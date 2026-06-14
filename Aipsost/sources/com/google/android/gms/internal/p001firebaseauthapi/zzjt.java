package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjt extends zzadf implements zzael {
    private static final zzjt zzb;
    private int zzd;

    static {
        zzjt zzjtVar = new zzjt();
        zzb = zzjtVar;
        zzadf.zzG(zzjt.class, zzjtVar);
    }

    private zzjt() {
    }

    public static zzjs zzb() {
        return (zzjs) zzb.zzt();
    }

    public static zzjt zzd() {
        return zzb;
    }

    public final int zza() {
        return this.zzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzjr zzjrVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0001\u0000\u0000\u0001\u0001\u0001\u0000\u0000\u0000\u0001\u000b", new Object[]{"zzd"});
            case 3:
                return new zzjt();
            case 4:
                return new zzjs(zzjrVar);
            case 5:
                return zzb;
        }
    }
}
