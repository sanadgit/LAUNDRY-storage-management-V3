package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import javax.crypto.spec.SecretKeySpec;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzif extends zzgw {
    zzif(Class cls) {
        super(cls);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgw
    public final /* bridge */ /* synthetic */ Object zza(zzaek zzaekVar) throws GeneralSecurityException {
        zzmt zzmtVar = (zzmt) zzaekVar;
        int iZzf = zzmtVar.zzf().zzf();
        SecretKeySpec secretKeySpec = new SecretKeySpec(zzmtVar.zzg().zzt(), "HMAC");
        int iZza = zzmtVar.zzf().zza();
        switch (iZzf - 2) {
            case 1:
                return new zzqo(new zzqn("HMACSHA1", secretKeySpec), iZza);
            case 2:
                return new zzqo(new zzqn("HMACSHA384", secretKeySpec), iZza);
            case 3:
                return new zzqo(new zzqn("HMACSHA256", secretKeySpec), iZza);
            case 4:
                return new zzqo(new zzqn("HMACSHA512", secretKeySpec), iZza);
            case 5:
                return new zzqo(new zzqn("HMACSHA224", secretKeySpec), iZza);
            default:
                throw new GeneralSecurityException("unknown hash");
        }
    }
}
