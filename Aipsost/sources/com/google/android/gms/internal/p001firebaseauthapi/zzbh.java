package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;
import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbh {
    private final zzof zza;
    private final zzjc zzb = zzjc.zza;

    private zzbh(zzof zzofVar) {
        this.zza = zzofVar;
    }

    static final zzbh zza(zzof zzofVar) throws GeneralSecurityException {
        zzi(zzofVar);
        return new zzbh(zzofVar);
    }

    public static final zzbh zzh(zzfq zzfqVar, zzap zzapVar) throws GeneralSecurityException, IOException {
        byte[] bArr = new byte[0];
        zzmo zzmoVarZza = zzfqVar.zza();
        if (zzmoVarZza == null || zzmoVarZza.zzd().zzd() == 0) {
            throw new GeneralSecurityException("empty keyset");
        }
        try {
            zzof zzofVarZzf = zzof.zzf(zzapVar.zza(zzmoVarZza.zzd().zzt(), bArr), zzacs.zza());
            zzi(zzofVarZzf);
            return new zzbh(zzofVarZzf);
        } catch (zzadn e) {
            throw new GeneralSecurityException("invalid keyset, corrupted key material");
        }
    }

    private static void zzi(zzof zzofVar) throws GeneralSecurityException {
        if (zzofVar == null || zzofVar.zza() <= 0) {
            throw new GeneralSecurityException("empty keyset");
        }
    }

    public final String toString() {
        return zzcb.zza(this.zza).toString();
    }

    public final zzbh zzb() throws GeneralSecurityException {
        if (this.zza == null) {
            throw new GeneralSecurityException("cleartext keyset is not available");
        }
        zzoc zzocVarZzc = zzof.zzc();
        for (zzoe zzoeVar : this.zza.zzg()) {
            zzns zznsVarZzb = zzoeVar.zzb();
            if (zznsVarZzb.zzb() != zznr.ASYMMETRIC_PRIVATE) {
                throw new GeneralSecurityException("The keyset contains a non-private key");
            }
            String strZzf = zznsVarZzb.zzf();
            zzacc zzaccVarZze = zznsVarZzb.zze();
            zzax zzaxVarZza = zzbz.zza(strZzf);
            if (!(zzaxVarZza instanceof zzbw)) {
                throw new GeneralSecurityException("manager for key type " + strZzf + " is not a PrivateKeyManager");
            }
            zzns zznsVarZzf = ((zzbw) zzaxVarZza).zzf(zzaccVarZze);
            zzbz.zzf(zznsVarZzf);
            zzod zzodVar = (zzod) zzoeVar.zzu();
            zzodVar.zza(zznsVarZzf);
            zzocVarZzc.zzb((zzoe) zzodVar.zzi());
        }
        zzocVarZzc.zzc(this.zza.zzb());
        return new zzbh((zzof) zzocVarZzc.zzi());
    }

    final zzof zzc() {
        return this.zza;
    }

    public final zzok zzd() {
        return zzcb.zza(this.zza);
    }

    public final Object zze(Class cls) throws GeneralSecurityException {
        Class clsZze = zzbz.zze(cls);
        if (clsZze == null) {
            throw new GeneralSecurityException("No wrapper found for ".concat(String.valueOf(cls.getName())));
        }
        zzcb.zzb(this.zza);
        zzbp zzbpVar = new zzbp(clsZze, null);
        zzbpVar.zzc(this.zzb);
        for (zzoe zzoeVar : this.zza.zzg()) {
            if (zzoeVar.zzk() == 3) {
                Object objZzg = zzbz.zzg(zzoeVar.zzb(), clsZze);
                if (zzoeVar.zza() == this.zza.zzb()) {
                    zzbpVar.zza(objZzg, zzoeVar);
                } else {
                    zzbpVar.zzb(objZzg, zzoeVar);
                }
            }
        }
        return zzbz.zzk(zzbpVar.zzd(), cls);
    }

    public final void zzf(zzbj zzbjVar, zzap zzapVar) throws GeneralSecurityException, IOException {
        byte[] bArr = new byte[0];
        zzof zzofVar = this.zza;
        byte[] bArrZzb = zzapVar.zzb(zzofVar.zzq(), bArr);
        try {
            if (!zzof.zzf(zzapVar.zza(bArrZzb, bArr), zzacs.zza()).equals(zzofVar)) {
                throw new GeneralSecurityException("cannot encrypt keyset");
            }
            zzmn zzmnVarZza = zzmo.zza();
            zzmnVarZza.zza(zzacc.zzn(bArrZzb));
            zzmnVarZza.zzb(zzcb.zza(zzofVar));
            zzbjVar.zzb((zzmo) zzmnVarZza.zzi());
        } catch (zzadn e) {
            throw new GeneralSecurityException("invalid keyset, corrupted key material");
        }
    }

    public final void zzg(zzbj zzbjVar) throws GeneralSecurityException, IOException {
        for (zzoe zzoeVar : this.zza.zzg()) {
            if (zzoeVar.zzb().zzb() == zznr.UNKNOWN_KEYMATERIAL || zzoeVar.zzb().zzb() == zznr.SYMMETRIC || zzoeVar.zzb().zzb() == zznr.ASYMMETRIC_PRIVATE) {
                throw new GeneralSecurityException(String.format("keyset contains key material of type %s for type url %s", zzoeVar.zzb().zzb().name(), zzoeVar.zzb().zzf()));
            }
        }
        zzbjVar.zzc(this.zza);
    }
}
