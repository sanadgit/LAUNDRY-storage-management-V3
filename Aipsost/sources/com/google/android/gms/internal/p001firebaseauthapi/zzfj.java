package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfj implements zzey {
    private final zzqv zza;
    private final zzqv zzb;

    private zzfj(byte[] bArr, byte[] bArr2) {
        this.zza = zzqv.zzb(bArr);
        this.zzb = zzqv.zzb(bArr2);
    }

    static zzfj zzc(byte[] bArr) throws GeneralSecurityException {
        return new zzfj(bArr, zzqt.zzb(bArr));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzey
    public final zzqv zza() {
        return this.zza;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzey
    public final zzqv zzb() {
        return this.zzb;
    }
}
