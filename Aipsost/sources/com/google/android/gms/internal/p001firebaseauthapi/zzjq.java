package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjq extends zzadf implements zzael {
    private static final zzjq zzb;
    private int zzd;
    private zzjt zze;

    static {
        zzjq zzjqVar = new zzjq();
        zzb = zzjqVar;
        zzadf.zzG(zzjq.class, zzjqVar);
    }

    private zzjq() {
    }

    public static zzjp zzb() {
        return (zzjp) zzb.zzt();
    }

    public static zzjq zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzjq) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzg(zzjq zzjqVar, zzjt zzjtVar) {
        zzjtVar.getClass();
        zzjqVar.zze = zzjtVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzjt zze() {
        zzjt zzjtVar = this.zze;
        return zzjtVar == null ? zzjt.zzd() : zzjtVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzjo zzjoVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\u000b\u0002\t", new Object[]{"zzd", "zze"});
            case 3:
                return new zzjq();
            case 4:
                return new zzjp(zzjoVar);
            case 5:
                return zzb;
        }
    }
}
