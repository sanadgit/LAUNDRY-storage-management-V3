package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzig extends zzgb {
    final /* synthetic */ zzih zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzig(zzih zzihVar, Class cls) {
        super(cls);
        this.zza = zzihVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzmw zzmwVar = (zzmw) zzaekVar;
        zzms zzmsVarZzb = zzmt.zzb();
        zzmsVarZzb.zzc(0);
        zzmsVarZzb.zzb(zzmwVar.zzf());
        zzmsVarZzb.zza(zzacc.zzn(zzqq.zza(zzmwVar.zza())));
        return (zzmt) zzmsVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzmw.zze(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() throws GeneralSecurityException {
        HashMap map = new HashMap();
        map.put("HMAC_SHA256_128BITTAG", zzih.zzi(32, 16, 5, 1));
        map.put("HMAC_SHA256_128BITTAG_RAW", zzih.zzi(32, 16, 5, 3));
        map.put("HMAC_SHA256_256BITTAG", zzih.zzi(32, 32, 5, 1));
        map.put("HMAC_SHA256_256BITTAG_RAW", zzih.zzi(32, 32, 5, 3));
        map.put("HMAC_SHA512_128BITTAG", zzih.zzi(64, 16, 6, 1));
        map.put("HMAC_SHA512_128BITTAG_RAW", zzih.zzi(64, 16, 6, 3));
        map.put("HMAC_SHA512_256BITTAG", zzih.zzi(64, 32, 6, 1));
        map.put("HMAC_SHA512_256BITTAG_RAW", zzih.zzi(64, 32, 6, 3));
        map.put("HMAC_SHA512_512BITTAG", zzih.zzi(64, 64, 6, 1));
        map.put("HMAC_SHA512_512BITTAG_RAW", zzih.zzi(64, 64, 6, 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
        zzmw zzmwVar = (zzmw) zzaekVar;
        if (zzmwVar.zza() < 16) {
            throw new GeneralSecurityException("key too short");
        }
        zzih.zzn(zzmwVar.zzf());
    }
}
