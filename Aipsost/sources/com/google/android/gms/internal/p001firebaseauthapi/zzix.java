package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.logging.Level;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzix implements zzbm {
    private final zzbu zza;
    private final zzjd zzb;
    private final zzjd zzc;

    /* synthetic */ zzix(zzbu zzbuVar, zziw zziwVar) {
        zzjd zzjdVarZza;
        this.zza = zzbuVar;
        if (zzbuVar.zzf()) {
            zzje zzjeVarZzb = zzgm.zza().zzb();
            zzjj zzjjVarZza = zzgj.zza(zzbuVar);
            this.zzb = zzjeVarZzb.zza(zzjjVarZza, "mac", "compute");
            zzjdVarZza = zzjeVarZzb.zza(zzjjVarZza, "mac", "verify");
        } else {
            zzjdVarZza = zzgj.zza;
            this.zzb = zzjdVarZza;
        }
        this.zzc = zzjdVarZza;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbm
    public final void zza(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        int length = bArr.length;
        if (length <= 5) {
            throw new GeneralSecurityException("tag too short");
        }
        byte[] bArrCopyOf = Arrays.copyOf(bArr, 5);
        byte[] bArrCopyOfRange = Arrays.copyOfRange(bArr, 5, length);
        for (zzbq zzbqVar : this.zza.zze(bArrCopyOf)) {
            try {
                ((zzbm) zzbqVar.zze()).zza(bArrCopyOfRange, zzbqVar.zzd().equals(zzoy.LEGACY) ? zzpp.zzc(bArr2, zziy.zzb) : bArr2);
                zzbqVar.zza();
                return;
            } catch (GeneralSecurityException e) {
                zziy.zza.logp(Level.INFO, "com.google.crypto.tink.mac.MacWrapper$WrappedMac", "verifyMac", "tag prefix matches a key, but cannot verify: ".concat(e.toString()));
            }
        }
        for (zzbq zzbqVar2 : this.zza.zze(zzas.zza)) {
            try {
                ((zzbm) zzbqVar2.zze()).zza(bArr, bArr2);
                zzbqVar2.zza();
                return;
            } catch (GeneralSecurityException e2) {
            }
        }
        throw new GeneralSecurityException("invalid MAC");
    }
}
