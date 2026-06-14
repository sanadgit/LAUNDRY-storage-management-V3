package com.google.android.gms.internal.p001firebaseauthapi;

import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzic {
    private zzin zza = null;
    private zzqw zzb = null;

    @Nullable
    private Integer zzc = null;

    private zzic() {
    }

    /* synthetic */ zzic(zzib zzibVar) {
    }

    public final zzic zza(@Nullable Integer num) {
        this.zzc = num;
        return this;
    }

    public final zzic zzb(zzqw zzqwVar) {
        this.zzb = zzqwVar;
        return this;
    }

    public final zzic zzc(zzin zzinVar) {
        this.zza = zzinVar;
        return this;
    }

    public final zzie zzd() throws GeneralSecurityException {
        zzqw zzqwVar;
        zzqv zzqvVarZzb;
        zzin zzinVar = this.zza;
        if (zzinVar == null || (zzqwVar = this.zzb) == null) {
            throw new GeneralSecurityException("Cannot build without parameters and/or key material");
        }
        if (zzinVar.zza() != zzqwVar.zza()) {
            throw new GeneralSecurityException("Key size mismatch");
        }
        if (zzinVar.zzd() && this.zzc == null) {
            throw new GeneralSecurityException("Cannot create key without ID requirement with format with ID requirement");
        }
        if (!this.zza.zzd() && this.zzc != null) {
            throw new GeneralSecurityException("Cannot create key with ID requirement with format without ID requirement");
        }
        if (this.zza.zzc() == zzil.zzd) {
            zzqvVarZzb = zzqv.zzb(new byte[0]);
        } else if (this.zza.zzc() == zzil.zzc || this.zza.zzc() == zzil.zzb) {
            zzqvVarZzb = zzqv.zzb(ByteBuffer.allocate(5).put((byte) 0).putInt(this.zzc.intValue()).array());
        } else {
            if (this.zza.zzc() != zzil.zza) {
                throw new IllegalStateException("Unknown HmacParameters.Variant: ".concat(String.valueOf(String.valueOf(this.zza.zzc()))));
            }
            zzqvVarZzb = zzqv.zzb(ByteBuffer.allocate(5).put((byte) 1).putInt(this.zzc.intValue()).array());
        }
        return new zzie(this.zza, this.zzb, zzqvVarZzb, this.zzc, null);
    }
}
