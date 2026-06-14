package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzcr extends zzgb {
    final /* synthetic */ zzcs zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzcr(zzcs zzcsVar, Class cls) {
        super(cls);
        this.zza = zzcsVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzkt zzktVarZzb = zzku.zzb();
        zzktVarZzb.zza(zzacc.zzn(zzqq.zza(((zzkx) zzaekVar).zza())));
        zzktVarZzb.zzb(0);
        return (zzku) zzktVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzkx.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() throws GeneralSecurityException {
        HashMap map = new HashMap();
        map.put("AES128_GCM", zzcs.zzg(16, 1));
        map.put("AES128_GCM_RAW", zzcs.zzg(16, 3));
        map.put("AES256_GCM", zzcs.zzg(32, 1));
        map.put("AES256_GCM_RAW", zzcs.zzg(32, 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
        zzqs.zzb(((zzkx) zzaekVar).zza());
    }
}
