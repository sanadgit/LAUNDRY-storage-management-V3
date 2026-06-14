package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzis {
    public static final /* synthetic */ int zza = 0;
    private static final zzqv zzb;
    private static final zzgv zzc;
    private static final zzgr zzd;
    private static final zzfz zze;
    private static final zzfv zzf;

    static {
        zzqv zzqvVarZzb = zzhj.zzb("type.googleapis.com/google.crypto.tink.HmacKey");
        zzb = zzqvVarZzb;
        zzc = zzgv.zza(new zzgt() { // from class: com.google.android.gms.internal.firebase-auth-api.zzio
        }, zzin.class, zzgz.class);
        zzd = zzgr.zza(new zzgp() { // from class: com.google.android.gms.internal.firebase-auth-api.zzip
        }, zzqvVarZzb, zzgz.class);
        zze = zzfz.zza(new zzfx() { // from class: com.google.android.gms.internal.firebase-auth-api.zziq
        }, zzie.class, zzgy.class);
        zzf = zzfv.zzb(new zzft() { // from class: com.google.android.gms.internal.firebase-auth-api.zzir
            @Override // com.google.android.gms.internal.p001firebaseauthapi.zzft
            public final zzaw zza(zzha zzhaVar, zzca zzcaVar) throws GeneralSecurityException {
                zzik zzikVar;
                zzil zzilVar;
                int i = zzis.zza;
                if (!((zzgy) zzhaVar).zzg().equals("type.googleapis.com/google.crypto.tink.HmacKey")) {
                    throw new IllegalArgumentException("Wrong type URL in call to HmacParameters.parseParameters");
                }
                try {
                    zzmt zzmtVarZze = zzmt.zze(((zzgy) zzhaVar).zze(), zzacs.zza());
                    if (zzmtVarZze.zza() != 0) {
                        throw new GeneralSecurityException("Only version 0 keys are accepted");
                    }
                    zzij zzijVar = new zzij(null);
                    zzijVar.zzb(zzmtVarZze.zzg().zzd());
                    zzijVar.zzc(zzmtVarZze.zzf().zza());
                    int iZzf = zzmtVarZze.zzf().zzf();
                    zzoy zzoyVar = zzoy.UNKNOWN_PREFIX;
                    switch (iZzf - 2) {
                        case 1:
                            zzikVar = zzik.zza;
                            break;
                        case 2:
                            zzikVar = zzik.zzd;
                            break;
                        case 3:
                            zzikVar = zzik.zzc;
                            break;
                        case 4:
                            zzikVar = zzik.zze;
                            break;
                        case 5:
                            zzikVar = zzik.zzb;
                            break;
                        default:
                            throw new GeneralSecurityException("Unable to parse HashType: " + zzmq.zza(iZzf));
                    }
                    zzijVar.zza(zzikVar);
                    zzoy zzoyVarZzc = ((zzgy) zzhaVar).zzc();
                    switch (zzoyVarZzc.ordinal()) {
                        case 1:
                            zzilVar = zzil.zza;
                            break;
                        case 2:
                            zzilVar = zzil.zzc;
                            break;
                        case 3:
                            zzilVar = zzil.zzd;
                            break;
                        case 4:
                            zzilVar = zzil.zzb;
                            break;
                        default:
                            throw new GeneralSecurityException("Unable to parse OutputPrefixType: " + zzoyVarZzc.zza());
                    }
                    zzijVar.zzd(zzilVar);
                    zzin zzinVarZze = zzijVar.zze();
                    zzic zzicVar = new zzic(null);
                    zzicVar.zzc(zzinVarZze);
                    zzicVar.zzb(zzqw.zzb(zzmtVarZze.zzg().zzt(), zzcaVar));
                    zzicVar.zza(((zzgy) zzhaVar).zzf());
                    return zzicVar.zzd();
                } catch (zzadn | IllegalArgumentException e) {
                    throw new GeneralSecurityException("Parsing HmacKey failed");
                }
            }
        }, zzqvVarZzb, zzgy.class);
    }

    public static void zza() throws GeneralSecurityException {
        zzgn zzgnVarZzb = zzgn.zzb();
        zzgnVarZzb.zzf(zzc);
        zzgnVarZzb.zze(zzd);
        zzgnVarZzb.zzd(zze);
        zzgnVarZzb.zzc(zzf);
    }
}
