package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjn extends zzadf implements zzael {
    private static final zzjn zzb;
    private int zzd;
    private zzacc zze = zzacc.zzb;
    private zzjt zzf;

    static {
        zzjn zzjnVar = new zzjn();
        zzb = zzjnVar;
        zzadf.zzG(zzjn.class, zzjnVar);
    }

    private zzjn() {
    }

    public static zzjm zzb() {
        return (zzjm) zzb.zzt();
    }

    public static zzjn zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzjn) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzi(zzjn zzjnVar, zzjt zzjtVar) {
        zzjtVar.getClass();
        zzjnVar.zzf = zzjtVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzjt zze() {
        zzjt zzjtVar = this.zzf;
        return zzjtVar == null ? zzjt.zzd() : zzjtVar;
    }

    public final zzacc zzf() {
        return this.zze;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzjl zzjlVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\u000b\u0002\n\u0003\t", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zzjn();
            case 4:
                return new zzjm(zzjlVar);
            case 5:
                return zzb;
        }
    }
}
