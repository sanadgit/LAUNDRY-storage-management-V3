package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzof extends zzadf implements zzael {
    private static final zzof zzb;
    private int zzd;
    private zzadk zze = zzz();

    static {
        zzof zzofVar = new zzof();
        zzb = zzofVar;
        zzadf.zzG(zzof.class, zzofVar);
    }

    private zzof() {
    }

    public static zzoc zzc() {
        return (zzoc) zzb.zzt();
    }

    public static zzof zzf(byte[] bArr, zzacs zzacsVar) throws zzadn {
        return (zzof) zzadf.zzy(zzb, bArr, zzacsVar);
    }

    static /* synthetic */ void zzi(zzof zzofVar, zzoe zzoeVar) {
        zzoeVar.getClass();
        zzadk zzadkVar = zzofVar.zze;
        if (!zzadkVar.zzc()) {
            zzofVar.zze = zzadf.zzA(zzadkVar);
        }
        zzofVar.zze.add(zzoeVar);
    }

    public final int zza() {
        return this.zze.size();
    }

    public final int zzb() {
        return this.zzd;
    }

    public final zzoe zzd(int i) {
        return (zzoe) this.zze.get(i);
    }

    public final List zzg() {
        return this.zze;
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
                return zzD(zzb, "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0001\u0000\u0001\u000b\u0002\u001b", new Object[]{"zzd", "zze", zzoe.class});
            case 3:
                return new zzof();
            case 4:
                return new zzoc(zzobVar);
            case 5:
                return zzb;
        }
    }
}
