package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzhs {

    @Nullable
    private Integer zza;

    @Nullable
    private Integer zzb;
    private zzht zzc;

    private zzhs() {
        this.zza = null;
        this.zzb = null;
        throw null;
    }

    /* synthetic */ zzhs(zzhr zzhrVar) {
        this.zza = null;
        this.zzb = null;
        this.zzc = zzht.zzd;
    }

    public final zzhs zzb(int i) throws GeneralSecurityException {
        if (i >= 10 && i <= 16) {
            this.zzb = Integer.valueOf(i);
            return this;
        }
        throw new GeneralSecurityException("Invalid tag size for AesCmacParameters: " + i);
    }

    public final zzhs zzc(zzht zzhtVar) {
        this.zzc = zzhtVar;
        return this;
    }

    public final zzhv zzd() throws GeneralSecurityException {
        Integer num = this.zza;
        if (num == null || this.zzb == null) {
            throw new GeneralSecurityException("Key size and/or tag size not set");
        }
        return new zzhv(num.intValue(), this.zzb.intValue(), this.zzc, null);
    }

    public final zzhs zza(int i) throws GeneralSecurityException {
        if (i != 16 && i != 32) {
            throw new InvalidAlgorithmParameterException(String.format("Invalid key size %d; only 128-bit and 256-bit AES keys are supported", Integer.valueOf(i * 8)));
        }
        this.zza = Integer.valueOf(i);
        return this;
    }
}
