package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzev implements zzau {
    private static final byte[] zza = new byte[0];
    private final zzey zzb;
    private final zzex zzc;
    private final zzet zzd;
    private final int zze;
    private final zzes zzf;

    private zzev(zzey zzeyVar, zzex zzexVar, zzes zzesVar, zzet zzetVar, int i, byte[] bArr) {
        this.zzb = zzeyVar;
        this.zzc = zzexVar;
        this.zzf = zzesVar;
        this.zzd = zzetVar;
        this.zze = i;
    }

    static zzev zzb(zznk zznkVar) throws GeneralSecurityException {
        int i;
        zzey zzeyVarZzc;
        if (!zznkVar.zzk()) {
            throw new IllegalArgumentException("HpkePrivateKey is missing public_key field.");
        }
        if (!zznkVar.zze().zzl()) {
            throw new IllegalArgumentException("HpkePrivateKey.public_key is missing params field.");
        }
        if (zznkVar.zzf().zzs()) {
            throw new IllegalArgumentException("HpkePrivateKey.private_key is empty.");
        }
        zznh zznhVarZzb = zznkVar.zze().zzb();
        zzex zzexVarZzb = zzez.zzb(zznhVarZzb);
        zzes zzesVarZzc = zzez.zzc(zznhVarZzb);
        zzet zzetVarZza = zzez.zza(zznhVarZzb);
        int iZzf = zznhVarZzb.zzf();
        switch (iZzf - 2) {
            case 1:
                i = 32;
                break;
            case 2:
                i = 65;
                break;
            case 3:
                i = 97;
                break;
            case 4:
                i = 133;
                break;
            default:
                throw new IllegalArgumentException("Unable to determine KEM-encoding length for ".concat(zznb.zza(iZzf)));
        }
        switch (zznkVar.zze().zzb().zzf() - 2) {
            case 1:
                zzeyVarZzc = zzfj.zzc(zznkVar.zzf().zzt());
                break;
            case 2:
            case 3:
            case 4:
                zzeyVarZzc = zzfh.zzc(zznkVar.zzf().zzt(), zznkVar.zze().zzg().zzt(), zzff.zzg(zznkVar.zze().zzb().zzf()));
                break;
            default:
                throw new GeneralSecurityException("Unrecognized HPKE KEM identifier");
        }
        return new zzev(zzeyVarZzc, zzexVarZzb, zzesVarZzc, zzetVarZza, i, null);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzau
    public final byte[] zza(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        int length = bArr.length;
        int i = this.zze;
        if (length < i) {
            throw new GeneralSecurityException("Ciphertext is too short.");
        }
        byte[] bArrCopyOf = Arrays.copyOf(bArr, i);
        byte[] bArrCopyOfRange = Arrays.copyOfRange(bArr, this.zze, length);
        zzey zzeyVar = this.zzb;
        zzex zzexVar = this.zzc;
        zzes zzesVar = this.zzf;
        zzet zzetVar = this.zzd;
        return zzeu.zzb(bArrCopyOf, zzexVar.zza(bArrCopyOf, zzeyVar), zzexVar, zzesVar, zzetVar, new byte[0]).zza(bArrCopyOfRange, zza);
    }
}
