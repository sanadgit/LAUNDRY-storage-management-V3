package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzcm extends zzgc {
    zzcm() {
        super(zzkc.class, new zzck(zzqk.class));
    }

    public static final void zzh(zzkc zzkcVar) throws GeneralSecurityException {
        zzqs.zzc(zzkcVar.zza(), 0);
        zzqs.zzb(zzkcVar.zzg().zzd());
        zzi(zzkcVar.zzf());
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void zzi(zzki zzkiVar) throws GeneralSecurityException {
        if (zzkiVar.zza() < 12 || zzkiVar.zza() > 16) {
            throw new GeneralSecurityException("invalid IV size");
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zzgb zza() {
        return new zzcl(this, zzkf.class);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zznr zzb() {
        return zznr.SYMMETRIC;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* synthetic */ zzaek zzc(zzacc zzaccVar) throws zzadn {
        return zzkc.zze(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final String zzd() {
        return "type.googleapis.com/google.crypto.tink.AesCtrKey";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* bridge */ /* synthetic */ void zze(zzaek zzaekVar) throws GeneralSecurityException {
        zzh((zzkc) zzaekVar);
    }
}
