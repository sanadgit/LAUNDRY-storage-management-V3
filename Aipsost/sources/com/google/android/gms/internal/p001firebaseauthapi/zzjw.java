package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjw extends zzadf implements zzael {
    private static final zzjw zzb;
    private int zzd;
    private zzkc zze;
    private zzmt zzf;

    static {
        zzjw zzjwVar = new zzjw();
        zzb = zzjwVar;
        zzadf.zzG(zzjw.class, zzjwVar);
    }

    private zzjw() {
    }

    public static zzjv zzb() {
        return (zzjv) zzb.zzt();
    }

    public static zzjw zzd(zzacc zzaccVar, zzacs zzacsVar) throws zzadn {
        return (zzjw) zzadf.zzx(zzb, zzaccVar, zzacsVar);
    }

    static /* synthetic */ void zzh(zzjw zzjwVar, zzkc zzkcVar) {
        zzkcVar.getClass();
        zzjwVar.zze = zzkcVar;
    }

    static /* synthetic */ void zzi(zzjw zzjwVar, zzmt zzmtVar) {
        zzmtVar.getClass();
        zzjwVar.zzf = zzmtVar;
    }

    public final int zza() {
        return this.zzd;
    }

    public final zzkc zze() {
        zzkc zzkcVar = this.zze;
        return zzkcVar == null ? zzkc.zzd() : zzkcVar;
    }

    public final zzmt zzf() {
        zzmt zzmtVar = this.zzf;
        return zzmtVar == null ? zzmt.zzd() : zzmtVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzju zzjuVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0003\u0000\u0000\u0001\u0003\u0003\u0000\u0000\u0000\u0001\u000b\u0002\t\u0003\t", new Object[]{"zzd", "zze", "zzf"});
            case 3:
                return new zzjw();
            case 4:
                return new zzjv(zzjuVar);
            case 5:
                return zzb;
        }
    }
}
