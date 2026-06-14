package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzlu extends zzadf implements zzael {
    private static final zzlu zzb;
    private zznx zzd;

    static {
        zzlu zzluVar = new zzlu();
        zzb = zzluVar;
        zzadf.zzG(zzlu.class, zzluVar);
    }

    private zzlu() {
    }

    public static zzlt zza() {
        return (zzlt) zzb.zzt();
    }

    public static zzlu zzc() {
        return zzb;
    }

    static /* synthetic */ void zze(zzlu zzluVar, zznx zznxVar) {
        zznxVar.getClass();
        zzluVar.zzd = zznxVar;
    }

    public final zznx zzd() {
        zznx zznxVar = this.zzd;
        return zznxVar == null ? zznx.zzc() : zznxVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzls zzlsVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0001\u0000\u0000\u0002\u0002\u0001\u0000\u0000\u0000\u0002\t", new Object[]{"zzd"});
            case 3:
                return new zzlu();
            case 4:
                return new zzlt(zzlsVar);
            case 5:
                return zzb;
        }
    }
}
