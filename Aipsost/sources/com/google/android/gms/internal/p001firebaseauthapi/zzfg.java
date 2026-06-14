package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfg implements zzex {
    private final zzes zza;
    private final int zzb;

    private zzfg(zzes zzesVar, int i) {
        this.zza = zzesVar;
        this.zzb = i;
    }

    static zzfg zzc(int i) throws GeneralSecurityException {
        switch (i - 1) {
            case 0:
                return new zzfg(new zzes("HmacSha256"), 1);
            case 1:
                return new zzfg(new zzes("HmacSha384"), 2);
            default:
                return new zzfg(new zzes("HmacSha512"), 3);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzex
    public final byte[] zza(byte[] bArr, zzey zzeyVar) throws GeneralSecurityException {
        byte[] bArrZzh = zzpx.zzh(zzpx.zzi(this.zzb, zzeyVar.zza().zzc()), zzpx.zzk(zzpx.zzl(this.zzb), 1, bArr));
        byte[] bArrZzc = zzpp.zzc(bArr, zzeyVar.zzb().zzc());
        byte[] bArrZzd = zzff.zzd(zzb());
        zzes zzesVar = this.zza;
        return zzesVar.zzb(null, bArrZzh, "eae_prk", bArrZzc, "shared_secret", bArrZzd, zzesVar.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzex
    public final byte[] zzb() throws GeneralSecurityException {
        switch (this.zzb - 1) {
            case 0:
                return zzff.zzc;
            case 1:
                return zzff.zzd;
            default:
                return zzff.zze;
        }
    }
}
