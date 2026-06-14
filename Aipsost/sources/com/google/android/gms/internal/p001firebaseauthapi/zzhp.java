package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhp extends zzgb {
    zzhp(zzhq zzhqVar, Class cls) {
        super(cls);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzjq zzjqVar = (zzjq) zzaekVar;
        zzjm zzjmVarZzb = zzjn.zzb();
        zzjmVarZzb.zzc(0);
        zzjmVarZzb.zza(zzacc.zzn(zzqq.zza(zzjqVar.zza())));
        zzjmVarZzb.zzb(zzjqVar.zze());
        return (zzjn) zzjmVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzjq.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() throws GeneralSecurityException {
        HashMap map = new HashMap();
        zzjp zzjpVarZzb = zzjq.zzb();
        zzjpVarZzb.zza(32);
        zzjs zzjsVarZzb = zzjt.zzb();
        zzjsVarZzb.zza(16);
        zzjpVarZzb.zzb((zzjt) zzjsVarZzb.zzi());
        map.put("AES_CMAC", new zzga((zzjq) zzjpVarZzb.zzi(), 1));
        zzjp zzjpVarZzb2 = zzjq.zzb();
        zzjpVarZzb2.zza(32);
        zzjs zzjsVarZzb2 = zzjt.zzb();
        zzjsVarZzb2.zza(16);
        zzjpVarZzb2.zzb((zzjt) zzjsVarZzb2.zzi());
        map.put("AES256_CMAC", new zzga((zzjq) zzjpVarZzb2.zzi(), 1));
        zzjp zzjpVarZzb3 = zzjq.zzb();
        zzjpVarZzb3.zza(32);
        zzjs zzjsVarZzb3 = zzjt.zzb();
        zzjsVarZzb3.zza(16);
        zzjpVarZzb3.zzb((zzjt) zzjsVarZzb3.zzi());
        map.put("AES256_CMAC_RAW", new zzga((zzjq) zzjpVarZzb3.zzi(), 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
        zzjq zzjqVar = (zzjq) zzaekVar;
        zzhq.zzi(zzjqVar.zze());
        zzhq.zzn(zzjqVar.zza());
    }
}
