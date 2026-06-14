package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzcy extends zzgc {
    zzcy() {
        super(zzlm.class, new zzcw(zzap.class));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zzgb zza() {
        return new zzcx(this, zzlp.class);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zznr zzb() {
        return zznr.SYMMETRIC;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* synthetic */ zzaek zzc(zzacc zzaccVar) throws zzadn {
        return zzlm.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final String zzd() {
        return "type.googleapis.com/google.crypto.tink.ChaCha20Poly1305Key";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* bridge */ /* synthetic */ void zze(zzaek zzaekVar) throws GeneralSecurityException {
        zzlm zzlmVar = (zzlm) zzaekVar;
        zzqs.zzc(zzlmVar.zza(), 0);
        if (zzlmVar.zze().zzd() != 32) {
            throw new GeneralSecurityException("invalid ChaCha20Poly1305Key: incorrect key length");
        }
    }
}
