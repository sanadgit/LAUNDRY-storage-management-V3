package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzhq extends zzgc {
    zzhq() {
        super(zzjn.class, new zzho(zzbm.class));
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static void zzi(zzjt zzjtVar) throws GeneralSecurityException {
        if (zzjtVar.zza() < 10) {
            throw new GeneralSecurityException("tag size too short");
        }
        if (zzjtVar.zza() > 16) {
            throw new GeneralSecurityException("tag size too long");
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static void zzn(int i) throws GeneralSecurityException {
        if (i != 32) {
            throw new GeneralSecurityException("AesCmacKey size wrong, must be 32 bytes");
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zzgb zza() {
        return new zzhp(this, zzjq.class);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zznr zzb() {
        return zznr.SYMMETRIC;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* synthetic */ zzaek zzc(zzacc zzaccVar) throws zzadn {
        return zzjn.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final String zzd() {
        return "type.googleapis.com/google.crypto.tink.AesCmacKey";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* bridge */ /* synthetic */ void zze(zzaek zzaekVar) throws GeneralSecurityException {
        zzjn zzjnVar = (zzjn) zzaekVar;
        zzqs.zzc(zzjnVar.zza(), 0);
        zzn(zzjnVar.zzf().zzd());
        zzi(zzjnVar.zze());
    }
}
