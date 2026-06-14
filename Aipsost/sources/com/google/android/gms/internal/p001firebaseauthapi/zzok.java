package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzok extends zzadf implements zzael {
    private static final zzok zzb;
    private int zzd;
    private zzadk zze = zzz();

    static {
        zzok zzokVar = new zzok();
        zzb = zzokVar;
        zzadf.zzG(zzok.class, zzokVar);
    }

    private zzok() {
    }

    public static zzoh zza() {
        return (zzoh) zzb.zzt();
    }

    static /* synthetic */ void zze(zzok zzokVar, zzoj zzojVar) {
        zzojVar.getClass();
        zzadk zzadkVar = zzokVar.zze;
        if (!zzadkVar.zzc()) {
            zzokVar.zze = zzadf.zzA(zzadkVar);
        }
        zzokVar.zze.add(zzojVar);
    }

    public final zzoj zzb(int i) {
        return (zzoj) this.zze.get(0);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadf
    protected final Object zzj(int i, Object obj, Object obj2) {
        zzog zzogVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0001\u0000\u0001\u000b\u0002\u001b", new Object[]{"zzd", "zze", zzoj.class});
            case 3:
                return new zzok();
            case 4:
                return new zzoh(zzogVar);
            case 5:
                return zzb;
        }
    }
}
