package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzcl extends zzgb {
    final /* synthetic */ zzcm zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzcl(zzcm zzcmVar, Class cls) {
        super(cls);
        this.zza = zzcmVar;
    }

    public static final zzkc zzf(zzkf zzkfVar) throws GeneralSecurityException {
        zzkb zzkbVarZzb = zzkc.zzb();
        zzkbVarZzb.zzb(zzkfVar.zzf());
        zzkbVarZzb.zza(zzacc.zzn(zzqq.zza(zzkfVar.zza())));
        zzkbVarZzb.zzc(0);
        return (zzkc) zzkbVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        return zzf((zzkf) zzaekVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzkf.zze(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    /* JADX INFO: renamed from: zze, reason: merged with bridge method [inline-methods] */
    public final void zzd(zzkf zzkfVar) throws GeneralSecurityException {
        zzqs.zzb(zzkfVar.zza());
        zzcm zzcmVar = this.zza;
        zzcm.zzi(zzkfVar.zzf());
    }
}
