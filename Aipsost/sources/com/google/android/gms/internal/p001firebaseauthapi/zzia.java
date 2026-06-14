package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzia {
    public static final /* synthetic */ int zza = 0;
    private static final zzqv zzb;
    private static final zzgv zzc;
    private static final zzgr zzd;
    private static final zzfz zze;
    private static final zzfv zzf;

    static {
        zzqv zzqvVarZzb = zzhj.zzb("type.googleapis.com/google.crypto.tink.AesCmacKey");
        zzb = zzqvVarZzb;
        zzc = zzgv.zza(new zzgt() { // from class: com.google.android.gms.internal.firebase-auth-api.zzhw
        }, zzhv.class, zzgz.class);
        zzd = zzgr.zza(new zzgp() { // from class: com.google.android.gms.internal.firebase-auth-api.zzhx
        }, zzqvVarZzb, zzgz.class);
        zze = zzfz.zza(new zzfx() { // from class: com.google.android.gms.internal.firebase-auth-api.zzhy
        }, zzhn.class, zzgy.class);
        zzf = zzfv.zzb(new zzft() { // from class: com.google.android.gms.internal.firebase-auth-api.zzhz
            @Override // com.google.android.gms.internal.p001firebaseauthapi.zzft
            public final zzaw zza(zzha zzhaVar, zzca zzcaVar) throws GeneralSecurityException {
                zzht zzhtVar;
                int i = zzia.zza;
                if (!((zzgy) zzhaVar).zzg().equals("type.googleapis.com/google.crypto.tink.AesCmacKey")) {
                    throw new IllegalArgumentException("Wrong type URL in call to AesCmacParameters.parseParameters");
                }
                try {
                    zzjn zzjnVarZzd = zzjn.zzd(((zzgy) zzhaVar).zze(), zzacs.zza());
                    if (zzjnVarZzd.zza() != 0) {
                        throw new GeneralSecurityException("Only version 0 keys are accepted");
                    }
                    zzhs zzhsVar = new zzhs(null);
                    zzhsVar.zza(zzjnVarZzd.zzf().zzd());
                    zzhsVar.zzb(zzjnVarZzd.zze().zza());
                    zzoy zzoyVarZzc = ((zzgy) zzhaVar).zzc();
                    zzoy zzoyVar = zzoy.UNKNOWN_PREFIX;
                    switch (zzoyVarZzc.ordinal()) {
                        case 1:
                            zzhtVar = zzht.zza;
                            break;
                        case 2:
                            zzhtVar = zzht.zzc;
                            break;
                        case 3:
                            zzhtVar = zzht.zzd;
                            break;
                        case 4:
                            zzhtVar = zzht.zzb;
                            break;
                        default:
                            throw new GeneralSecurityException("Unable to parse OutputPrefixType: " + zzoyVarZzc.zza());
                    }
                    zzhsVar.zzc(zzhtVar);
                    zzhv zzhvVarZzd = zzhsVar.zzd();
                    zzhl zzhlVar = new zzhl(null);
                    zzhlVar.zzc(zzhvVarZzd);
                    zzhlVar.zza(zzqw.zzb(zzjnVarZzd.zzf().zzt(), zzcaVar));
                    zzhlVar.zzb(((zzgy) zzhaVar).zzf());
                    return zzhlVar.zzd();
                } catch (zzadn | IllegalArgumentException e) {
                    throw new GeneralSecurityException("Parsing AesCmacKey failed");
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
