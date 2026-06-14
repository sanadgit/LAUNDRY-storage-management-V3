package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECPoint;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzee extends zzgb {
    final /* synthetic */ zzef zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzee(zzef zzefVar, Class cls) {
        super(cls);
        this.zza = zzefVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzlx zzlxVar = (zzlx) zzaekVar;
        KeyPair keyPairZzd = zzpx.zzd(zzpx.zzl(zzeo.zzc(zzlxVar.zzd().zze().zzf())));
        ECPublicKey eCPublicKey = (ECPublicKey) keyPairZzd.getPublic();
        ECPrivateKey eCPrivateKey = (ECPrivateKey) keyPairZzd.getPrivate();
        ECPoint w = eCPublicKey.getW();
        zzmf zzmfVarZzc = zzmg.zzc();
        zzmfVarZzc.zzb(0);
        zzmfVarZzc.zza(zzlxVar.zzd());
        zzmfVarZzc.zzc(zzacc.zzn(w.getAffineX().toByteArray()));
        zzmfVarZzc.zzd(zzacc.zzn(w.getAffineY().toByteArray()));
        zzmg zzmgVar = (zzmg) zzmfVarZzc.zzi();
        zzmc zzmcVarZzb = zzmd.zzb();
        zzmcVarZzb.zzc(0);
        zzmcVarZzb.zzb(zzmgVar);
        zzmcVarZzb.zza(zzacc.zzn(eCPrivateKey.getS().toByteArray()));
        return (zzmd) zzmcVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzlx.zzc(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() throws GeneralSecurityException {
        HashMap map = new HashMap();
        map.put("ECIES_P256_HKDF_HMAC_SHA256_AES128_GCM", zzef.zzi(4, 5, 3, zzbg.zza("AES128_GCM"), zzef.zza, 1));
        map.put("ECIES_P256_HKDF_HMAC_SHA256_AES128_GCM_RAW", zzef.zzi(4, 5, 3, zzbg.zza("AES128_GCM"), zzef.zza, 3));
        map.put("ECIES_P256_COMPRESSED_HKDF_HMAC_SHA256_AES128_GCM", zzef.zzi(4, 5, 4, zzbg.zza("AES128_GCM"), zzef.zza, 1));
        map.put("ECIES_P256_COMPRESSED_HKDF_HMAC_SHA256_AES128_GCM_RAW", zzef.zzi(4, 5, 4, zzbg.zza("AES128_GCM"), zzef.zza, 3));
        map.put("ECIES_P256_HKDF_HMAC_SHA256_AES128_GCM_COMPRESSED_WITHOUT_PREFIX", zzef.zzi(4, 5, 4, zzbg.zza("AES128_GCM"), zzef.zza, 3));
        map.put("ECIES_P256_HKDF_HMAC_SHA256_AES128_CTR_HMAC_SHA256", zzef.zzi(4, 5, 3, zzbg.zza("AES128_CTR_HMAC_SHA256"), zzef.zza, 1));
        map.put("ECIES_P256_HKDF_HMAC_SHA256_AES128_CTR_HMAC_SHA256_RAW", zzef.zzi(4, 5, 3, zzbg.zza("AES128_CTR_HMAC_SHA256"), zzef.zza, 3));
        map.put("ECIES_P256_COMPRESSED_HKDF_HMAC_SHA256_AES128_CTR_HMAC_SHA256", zzef.zzi(4, 5, 4, zzbg.zza("AES128_CTR_HMAC_SHA256"), zzef.zza, 1));
        map.put("ECIES_P256_COMPRESSED_HKDF_HMAC_SHA256_AES128_CTR_HMAC_SHA256_RAW", zzef.zzi(4, 5, 4, zzbg.zza("AES128_CTR_HMAC_SHA256"), zzef.zza, 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
        zzeo.zza(((zzlx) zzaekVar).zzd());
    }
}
