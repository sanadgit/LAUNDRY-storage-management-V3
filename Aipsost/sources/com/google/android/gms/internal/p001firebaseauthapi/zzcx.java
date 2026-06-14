package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzcx extends zzgb {
    final /* synthetic */ zzcy zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzcx(zzcy zzcyVar, Class cls) {
        super(cls);
        this.zza = zzcyVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzll zzllVarZzb = zzlm.zzb();
        zzllVarZzb.zzb(0);
        zzllVarZzb.zza(zzacc.zzn(zzqq.zza(32)));
        return (zzlm) zzllVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzlp.zzc(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() throws GeneralSecurityException {
        HashMap map = new HashMap();
        map.put("CHACHA20_POLY1305", new zzga(zzlp.zzb(), 1));
        map.put("CHACHA20_POLY1305_RAW", new zzga(zzlp.zzb(), 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
    }
}
