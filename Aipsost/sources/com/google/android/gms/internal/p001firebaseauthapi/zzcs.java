package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzcs extends zzgc {
    zzcs() {
        super(zzku.class, new zzcq(zzap.class));
    }

    static /* bridge */ /* synthetic */ zzga zzg(int i, int i2) {
        zzkw zzkwVarZzb = zzkx.zzb();
        zzkwVarZzb.zza(i);
        return new zzga((zzkx) zzkwVarZzb.zzi(), i2);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zzgb zza() {
        return new zzcr(this, zzkx.class);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zznr zzb() {
        return zznr.SYMMETRIC;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* synthetic */ zzaek zzc(zzacc zzaccVar) throws zzadn {
        return zzku.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final String zzd() {
        return "type.googleapis.com/google.crypto.tink.AesGcmKey";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* bridge */ /* synthetic */ void zze(zzaek zzaekVar) throws GeneralSecurityException {
        zzku zzkuVar = (zzku) zzaekVar;
        zzqs.zzc(zzkuVar.zza(), 0);
        zzqs.zzb(zzkuVar.zze().zzd());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final int zzf() {
        return 2;
    }
}
