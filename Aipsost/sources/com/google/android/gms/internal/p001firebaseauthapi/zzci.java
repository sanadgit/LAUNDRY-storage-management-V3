package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzci extends zzgb {
    final /* synthetic */ zzcj zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzci(zzcj zzcjVar, Class cls) {
        super(cls);
        this.zza = zzcjVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzjz zzjzVar = (zzjz) zzaekVar;
        new zzcm();
        zzkc zzkcVarZzf = zzcl.zzf(zzjzVar.zzd());
        zzaek zzaekVarZza = new zzih().zza().zza(zzjzVar.zze());
        zzjv zzjvVarZzb = zzjw.zzb();
        zzjvVarZzb.zza(zzkcVarZzf);
        zzjvVarZzb.zzb((zzmt) zzaekVarZza);
        zzjvVarZzb.zzc(0);
        return (zzjw) zzjvVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzjz.zzc(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() throws GeneralSecurityException {
        HashMap map = new HashMap();
        map.put("AES128_CTR_HMAC_SHA256", zzcj.zzg(16, 16, 32, 16, 5, 1));
        map.put("AES128_CTR_HMAC_SHA256_RAW", zzcj.zzg(16, 16, 32, 16, 5, 3));
        map.put("AES256_CTR_HMAC_SHA256", zzcj.zzg(32, 16, 32, 32, 5, 1));
        map.put("AES256_CTR_HMAC_SHA256_RAW", zzcj.zzg(32, 16, 32, 32, 5, 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
        zzjz zzjzVar = (zzjz) zzaekVar;
        ((zzcl) new zzcm().zza()).zzd(zzjzVar.zzd());
        new zzih().zza().zzd(zzjzVar.zze());
        zzqs.zzb(zzjzVar.zzd().zza());
    }
}
