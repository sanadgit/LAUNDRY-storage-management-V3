package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzcp extends zzgc {
    zzcp() {
        super(zzkl.class, new zzcn(zzap.class));
    }

    static /* bridge */ /* synthetic */ zzga zzg(int i, int i2, int i3) {
        zzkn zzknVarZzb = zzko.zzb();
        zzknVarZzb.zza(i);
        zzkq zzkqVarZzb = zzkr.zzb();
        zzkqVarZzb.zza(16);
        zzknVarZzb.zzb((zzkr) zzkqVarZzb.zzi());
        return new zzga((zzko) zzknVarZzb.zzi(), i3);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zzgb zza() {
        return new zzco(this, zzko.class);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zznr zzb() {
        return zznr.SYMMETRIC;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* synthetic */ zzaek zzc(zzacc zzaccVar) throws zzadn {
        return zzkl.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final String zzd() {
        return "type.googleapis.com/google.crypto.tink.AesEaxKey";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* bridge */ /* synthetic */ void zze(zzaek zzaekVar) throws GeneralSecurityException {
        zzkl zzklVar = (zzkl) zzaekVar;
        zzqs.zzc(zzklVar.zza(), 0);
        zzqs.zzb(zzklVar.zzf().zzd());
        if (zzklVar.zze().zza() != 12 && zzklVar.zze().zza() != 16) {
            throw new GeneralSecurityException("invalid IV size; acceptable values have 12 or 16 bytes");
        }
    }
}
