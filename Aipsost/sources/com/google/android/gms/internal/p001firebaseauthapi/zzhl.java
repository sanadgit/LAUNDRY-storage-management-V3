package com.google.android.gms.internal.p001firebaseauthapi;

import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzhl {
    private zzhv zza = null;
    private zzqw zzb = null;

    @Nullable
    private Integer zzc = null;

    private zzhl() {
    }

    /* synthetic */ zzhl(zzhk zzhkVar) {
    }

    public final zzhl zza(zzqw zzqwVar) throws GeneralSecurityException {
        this.zzb = zzqwVar;
        return this;
    }

    public final zzhl zzb(@Nullable Integer num) {
        this.zzc = num;
        return this;
    }

    public final zzhl zzc(zzhv zzhvVar) {
        this.zza = zzhvVar;
        return this;
    }

    public final zzhn zzd() throws GeneralSecurityException {
        zzqw zzqwVar;
        zzqv zzqvVarZzb;
        zzhv zzhvVar = this.zza;
        if (zzhvVar == null || (zzqwVar = this.zzb) == null) {
            throw new GeneralSecurityException("Cannot build without parameters and/or key material");
        }
        if (zzhvVar.zza() != zzqwVar.zza()) {
            throw new GeneralSecurityException("Key size mismatch");
        }
        if (zzhvVar.zzd() && this.zzc == null) {
            throw new GeneralSecurityException("Cannot create key without ID requirement with format with ID requirement");
        }
        if (!this.zza.zzd() && this.zzc != null) {
            throw new GeneralSecurityException("Cannot create key with ID requirement with format without ID requirement");
        }
        if (this.zza.zzc() == zzht.zzd) {
            zzqvVarZzb = zzqv.zzb(new byte[0]);
        } else if (this.zza.zzc() == zzht.zzc || this.zza.zzc() == zzht.zzb) {
            zzqvVarZzb = zzqv.zzb(ByteBuffer.allocate(5).put((byte) 0).putInt(this.zzc.intValue()).array());
        } else {
            if (this.zza.zzc() != zzht.zza) {
                throw new IllegalStateException("Unknown AesCmacParametersParameters.Variant: ".concat(String.valueOf(String.valueOf(this.zza.zzc()))));
            }
            zzqvVarZzb = zzqv.zzb(ByteBuffer.allocate(5).put((byte) 1).putInt(this.zzc.intValue()).array());
        }
        return new zzhn(this.zza, this.zzb, zzqvVarZzb, this.zzc, null);
    }
}
