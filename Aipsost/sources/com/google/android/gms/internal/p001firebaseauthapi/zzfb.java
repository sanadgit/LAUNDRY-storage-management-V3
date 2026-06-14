package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfb extends zzgb {
    final /* synthetic */ zzfc zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzfb(zzfc zzfcVar, Class cls) {
        super(cls);
        this.zza = zzfcVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* bridge */ /* synthetic */ zzaek zza(zzaek zzaekVar) throws GeneralSecurityException {
        byte[] bArrZza;
        byte[] bArrZzb;
        zzne zzneVar = (zzne) zzaekVar;
        switch (zzneVar.zzd().zzf() - 2) {
            case 1:
                bArrZza = zzqq.zza(32);
                bArrZza[0] = (byte) (bArrZza[0] | 7);
                int i = bArrZza[31] & 63;
                bArrZza[31] = (byte) i;
                bArrZza[31] = (byte) (i | 128);
                bArrZzb = zzqt.zzb(bArrZza);
                break;
            case 2:
            case 3:
            case 4:
                int iZzg = zzff.zzg(zzneVar.zzd().zzf());
                KeyPair keyPairZzd = zzpx.zzd(zzpx.zzl(iZzg));
                bArrZzb = zzpx.zzm(iZzg, 1, ((ECPublicKey) keyPairZzd.getPublic()).getW());
                bArrZza = ((ECPrivateKey) keyPairZzd.getPrivate()).getS().toByteArray();
                break;
            default:
                throw new GeneralSecurityException("Invalid KEM");
        }
        zznm zznmVarZzc = zznn.zzc();
        zznmVarZzc.zzc(0);
        zznmVarZzc.zza(zzneVar.zzd());
        zznmVarZzc.zzb(zzacc.zzn(bArrZzb));
        zznn zznnVar = (zznn) zznmVarZzc.zzi();
        zznj zznjVarZzb = zznk.zzb();
        zznjVarZzb.zzc(0);
        zznjVarZzb.zzb(zznnVar);
        zznjVarZzb.zza(zzacc.zzn(bArrZza));
        return (zznk) zznjVarZzb.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ zzaek zzb(zzacc zzaccVar) throws zzadn {
        return zzne.zzc(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final Map zzc() {
        HashMap map = new HashMap();
        map.put("DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_AES_128_GCM", zzfc.zzh(3, 3, 3, 1));
        map.put("DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_AES_128_GCM_RAW", zzfc.zzh(3, 3, 3, 3));
        map.put("DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_AES_256_GCM", zzfc.zzh(3, 3, 4, 1));
        map.put("DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_AES_256_GCM_RAW", zzfc.zzh(3, 3, 4, 3));
        map.put("DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_CHACHA20_POLY1305", zzfc.zzh(3, 3, 5, 1));
        map.put("DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_CHACHA20_POLY1305_RAW", zzfc.zzh(3, 3, 5, 3));
        map.put("DHKEM_P256_HKDF_SHA256_HKDF_SHA256_AES_128_GCM", zzfc.zzh(4, 3, 3, 1));
        map.put("DHKEM_P256_HKDF_SHA256_HKDF_SHA256_AES_128_GCM_RAW", zzfc.zzh(4, 3, 3, 3));
        map.put("DHKEM_P256_HKDF_SHA256_HKDF_SHA256_AES_256_GCM", zzfc.zzh(4, 3, 4, 1));
        map.put("DHKEM_P256_HKDF_SHA256_HKDF_SHA256_AES_256_GCM_RAW", zzfc.zzh(4, 3, 4, 3));
        map.put("DHKEM_P384_HKDF_SHA384_HKDF_SHA384_AES_128_GCM", zzfc.zzh(5, 4, 3, 1));
        map.put("DHKEM_P384_HKDF_SHA384_HKDF_SHA384_AES_128_GCM_RAW", zzfc.zzh(5, 4, 3, 3));
        map.put("DHKEM_P384_HKDF_SHA384_HKDF_SHA384_AES_256_GCM", zzfc.zzh(5, 4, 4, 1));
        map.put("DHKEM_P384_HKDF_SHA384_HKDF_SHA384_AES_256_GCM_RAW", zzfc.zzh(5, 4, 4, 3));
        map.put("DHKEM_P521_HKDF_SHA512_HKDF_SHA512_AES_128_GCM", zzfc.zzh(6, 5, 3, 1));
        map.put("DHKEM_P521_HKDF_SHA512_HKDF_SHA512_AES_128_GCM_RAW", zzfc.zzh(6, 5, 3, 3));
        map.put("DHKEM_P521_HKDF_SHA512_HKDF_SHA512_AES_256_GCM", zzfc.zzh(6, 5, 4, 1));
        map.put("DHKEM_P521_HKDF_SHA512_HKDF_SHA512_AES_256_GCM_RAW", zzfc.zzh(6, 5, 4, 3));
        return Collections.unmodifiableMap(map);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgb
    public final /* synthetic */ void zzd(zzaek zzaekVar) throws GeneralSecurityException {
        zzff.zza(((zzne) zzaekVar).zzd());
    }
}
