package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzij {

    @Nullable
    private Integer zza;

    @Nullable
    private Integer zzb;
    private zzik zzc;
    private zzil zzd;

    private zzij() {
        this.zza = null;
        this.zzb = null;
        this.zzc = null;
        throw null;
    }

    /* synthetic */ zzij(zzii zziiVar) {
        this.zza = null;
        this.zzb = null;
        this.zzc = null;
        this.zzd = zzil.zzd;
    }

    public final zzij zza(zzik zzikVar) {
        this.zzc = zzikVar;
        return this;
    }

    public final zzij zzb(int i) throws GeneralSecurityException {
        this.zza = Integer.valueOf(i);
        return this;
    }

    public final zzij zzc(int i) throws GeneralSecurityException {
        this.zzb = Integer.valueOf(i);
        return this;
    }

    public final zzij zzd(zzil zzilVar) {
        this.zzd = zzilVar;
        return this;
    }

    public final zzin zze() throws GeneralSecurityException {
        Integer num = this.zza;
        if (num == null) {
            throw new GeneralSecurityException("key size is not set");
        }
        if (this.zzb == null) {
            throw new GeneralSecurityException("tag size is not set");
        }
        if (this.zzc == null) {
            throw new GeneralSecurityException("hash type is not set");
        }
        if (num.intValue() < 16) {
            throw new InvalidAlgorithmParameterException(String.format("Invalid key size in bytes %d; must be at least 16 bytes", this.zza));
        }
        int iIntValue = this.zzb.intValue();
        zzik zzikVar = this.zzc;
        if (iIntValue < 10) {
            throw new GeneralSecurityException(String.format("Invalid tag size in bytes %d; must be at least 10 bytes", Integer.valueOf(iIntValue)));
        }
        if (zzikVar == zzik.zza) {
            if (iIntValue > 20) {
                throw new GeneralSecurityException(String.format("Invalid tag size in bytes %d; can be at most 20 bytes for SHA1", Integer.valueOf(iIntValue)));
            }
        } else if (zzikVar == zzik.zzb) {
            if (iIntValue > 28) {
                throw new GeneralSecurityException(String.format("Invalid tag size in bytes %d; can be at most 28 bytes for SHA224", Integer.valueOf(iIntValue)));
            }
        } else if (zzikVar == zzik.zzc) {
            if (iIntValue > 32) {
                throw new GeneralSecurityException(String.format("Invalid tag size in bytes %d; can be at most 32 bytes for SHA256", Integer.valueOf(iIntValue)));
            }
        } else if (zzikVar == zzik.zzd) {
            if (iIntValue > 48) {
                throw new GeneralSecurityException(String.format("Invalid tag size in bytes %d; can be at most 48 bytes for SHA384", Integer.valueOf(iIntValue)));
            }
        } else {
            if (zzikVar != zzik.zze) {
                throw new GeneralSecurityException("unknown hash type; must be SHA256, SHA384 or SHA512");
            }
            if (iIntValue > 64) {
                throw new GeneralSecurityException(String.format("Invalid tag size in bytes %d; can be at most 64 bytes for SHA512", Integer.valueOf(iIntValue)));
            }
        }
        return new zzin(this.zza.intValue(), this.zzb.intValue(), this.zzd, this.zzc, null);
    }
}
