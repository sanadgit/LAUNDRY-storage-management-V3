package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzep implements zzps {
    private final String zza;
    private final int zzb;
    private zzku zzc;
    private zzjw zzd;
    private int zze;
    private zzlg zzf;

    zzep(zznx zznxVar) throws GeneralSecurityException {
        String strZzf = zznxVar.zzf();
        this.zza = strZzf;
        if (strZzf.equals(zzcc.zzb)) {
            try {
                zzkx zzkxVarZzd = zzkx.zzd(zznxVar.zze(), zzacs.zza());
                this.zzc = (zzku) zzbz.zzd(zznxVar);
                this.zzb = zzkxVarZzd.zza();
                return;
            } catch (zzadn e) {
                throw new GeneralSecurityException("invalid KeyFormat protobuf, expected AesGcmKeyFormat", e);
            }
        }
        if (strZzf.equals(zzcc.zza)) {
            try {
                zzjz zzjzVarZzc = zzjz.zzc(zznxVar.zze(), zzacs.zza());
                this.zzd = (zzjw) zzbz.zzd(zznxVar);
                this.zze = zzjzVarZzc.zzd().zza();
                this.zzb = this.zze + zzjzVarZzc.zze().zza();
                return;
            } catch (zzadn e2) {
                throw new GeneralSecurityException("invalid KeyFormat protobuf, expected AesCtrHmacAeadKeyFormat", e2);
            }
        }
        if (!strZzf.equals(zzea.zza)) {
            throw new GeneralSecurityException("unsupported AEAD DEM key type: ".concat(String.valueOf(strZzf)));
        }
        try {
            zzlj zzljVarZzd = zzlj.zzd(zznxVar.zze(), zzacs.zza());
            this.zzf = (zzlg) zzbz.zzd(zznxVar);
            this.zzb = zzljVarZzd.zza();
        } catch (zzadn e3) {
            throw new GeneralSecurityException("invalid KeyFormat protobuf, expected AesCtrHmacAeadKeyFormat", e3);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzps
    public final int zza() {
        return this.zzb;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzps
    public final zzfk zzb(byte[] bArr) throws GeneralSecurityException {
        if (bArr.length != this.zzb) {
            throw new GeneralSecurityException("Symmetric key has incorrect length");
        }
        if (this.zza.equals(zzcc.zzb)) {
            zzkt zzktVarZzb = zzku.zzb();
            zzktVarZzb.zzh(this.zzc);
            zzktVarZzb.zza(zzacc.zzo(bArr, 0, this.zzb));
            return new zzfk((zzap) zzbz.zzi(this.zza, (zzku) zzktVarZzb.zzi(), zzap.class));
        }
        if (!this.zza.equals(zzcc.zza)) {
            if (!this.zza.equals(zzea.zza)) {
                throw new GeneralSecurityException("unknown DEM key type");
            }
            zzlf zzlfVarZzb = zzlg.zzb();
            zzlfVarZzb.zzh(this.zzf);
            zzlfVarZzb.zza(zzacc.zzo(bArr, 0, this.zzb));
            return new zzfk((zzat) zzbz.zzi(this.zza, (zzlg) zzlfVarZzb.zzi(), zzat.class));
        }
        byte[] bArrCopyOfRange = Arrays.copyOfRange(bArr, 0, this.zze);
        byte[] bArrCopyOfRange2 = Arrays.copyOfRange(bArr, this.zze, this.zzb);
        zzkb zzkbVarZzb = zzkc.zzb();
        zzkbVarZzb.zzh(this.zzd.zze());
        zzkbVarZzb.zza(zzacc.zzn(bArrCopyOfRange));
        zzkc zzkcVar = (zzkc) zzkbVarZzb.zzi();
        zzms zzmsVarZzb = zzmt.zzb();
        zzmsVarZzb.zzh(this.zzd.zzf());
        zzmsVarZzb.zza(zzacc.zzn(bArrCopyOfRange2));
        zzmt zzmtVar = (zzmt) zzmsVarZzb.zzi();
        zzjv zzjvVarZzb = zzjw.zzb();
        zzjvVarZzb.zzc(this.zzd.zza());
        zzjvVarZzb.zza(zzkcVar);
        zzjvVarZzb.zzb(zzmtVar);
        return new zzfk((zzap) zzbz.zzi(this.zza, (zzjw) zzjvVarZzb.zzi(), zzap.class));
    }
}
