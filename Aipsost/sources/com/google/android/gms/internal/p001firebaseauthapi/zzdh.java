package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzdh extends zzgb {
    final /* synthetic */ zzdi zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzdh(zzdi zzdiVar, Class cls) {
        super(cls);
        this.zza = zzdiVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzpd zzpdVarZzb = zzpe.zzb();
        zzpdVarZzb.zzb(0);
        zzpdVarZzb.zza(zzacc.zzn(zzqq.zza(32)));
        return (zzpe) zzpdVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzph.zzc(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() throws GeneralSecurityException {
        HashMap map = new HashMap();
        map.put("XCHACHA20_POLY1305", new zzga(zzph.zzb(), 1));
        map.put("XCHACHA20_POLY1305_RAW", new zzga(zzph.zzb(), 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
    }
}
