package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfc extends zzgx {
    public zzfc() {
        super(zznk.class, zznn.class, new zzfa(zzau.class));
    }

    static /* bridge */ /* synthetic */ zzga zzh(int i, int i2, int i3, int i4) {
        zzng zzngVarZza = zznh.zza();
        zzngVarZza.zzc(i);
        zzngVarZza.zzb(i2);
        zzngVarZza.zza(i3);
        zznh zznhVar = (zznh) zzngVarZza.zzi();
        zznd zzndVarZza = zzne.zza();
        zzndVarZza.zza(zznhVar);
        return new zzga((zzne) zzndVarZza.zzi(), i4);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zzgb zza() {
        return new zzfb(this, zzne.class);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zznr zzb() {
        return zznr.ASYMMETRIC_PRIVATE;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* synthetic */ zzaek zzc(zzacc zzaccVar) throws zzadn {
        return zznk.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final String zzd() {
        return "type.googleapis.com/google.crypto.tink.HpkePrivateKey";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* bridge */ /* synthetic */ void zze(zzaek zzaekVar) throws GeneralSecurityException {
        zznk zznkVar = (zznk) zzaekVar;
        if (zznkVar.zzf().zzs()) {
            throw new GeneralSecurityException("Private key is empty.");
        }
        if (!zznkVar.zzk()) {
            throw new GeneralSecurityException("Missing public key.");
        }
        zzqs.zzc(zznkVar.zza(), 0);
        zzff.zza(zznkVar.zze().zzb());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgx
    public final /* synthetic */ zzaek zzg(zzaek zzaekVar) throws GeneralSecurityException {
        return ((zznk) zzaekVar).zze();
    }
}
