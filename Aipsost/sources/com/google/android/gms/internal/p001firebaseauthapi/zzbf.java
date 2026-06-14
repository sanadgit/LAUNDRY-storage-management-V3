package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbf {
    private final zznx zza;

    private zzbf(zznx zznxVar) {
        this.zza = zznxVar;
    }

    public static zzbf zze(String str, byte[] bArr, int i) {
        zzoy zzoyVar;
        zznw zznwVarZza = zznx.zza();
        zznwVarZza.zzb(str);
        zznwVarZza.zzc(zzacc.zzn(bArr));
        switch (i - 1) {
            case 0:
                zzoyVar = zzoy.TINK;
                break;
            case 1:
                zzoyVar = zzoy.LEGACY;
                break;
            case 2:
                zzoyVar = zzoy.RAW;
                break;
            default:
                zzoyVar = zzoy.CRUNCHY;
                break;
        }
        zznwVarZza.zza(zzoyVar);
        return new zzbf((zznx) zznwVarZza.zzi());
    }

    final zznx zza() {
        return this.zza;
    }

    public final String zzb() {
        return this.zza.zzf();
    }

    public final byte[] zzc() {
        return this.zza.zze().zzt();
    }

    public final int zzd() {
        zzoy zzoyVarZzd = this.zza.zzd();
        zzoy zzoyVar = zzoy.UNKNOWN_PREFIX;
        switch (zzoyVarZzd.ordinal()) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 3:
                return 3;
            case 4:
                return 4;
            default:
                throw new IllegalArgumentException("Unknown output prefix type");
        }
    }
}
