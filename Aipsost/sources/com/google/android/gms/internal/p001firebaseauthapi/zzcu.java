package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzcu extends zzgb {
    final /* synthetic */ zzcv zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzcu(zzcv zzcvVar, Class cls) {
        super(cls);
        this.zza = zzcvVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzkz zzkzVarZzb = zzla.zzb();
        zzkzVarZzb.zza(zzacc.zzn(zzqq.zza(((zzld) zzaekVar).zza())));
        zzkzVarZzb.zzb(0);
        return (zzla) zzkzVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzld.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() throws GeneralSecurityException {
        HashMap map = new HashMap();
        map.put("AES128_GCM_SIV", zzcv.zzh(16, 1));
        map.put("AES128_GCM_SIV_RAW", zzcv.zzh(16, 3));
        map.put("AES256_GCM_SIV", zzcv.zzh(32, 1));
        map.put("AES256_GCM_SIV_RAW", zzcv.zzh(32, 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
        zzqs.zzb(((zzld) zzaekVar).zza());
    }
}
