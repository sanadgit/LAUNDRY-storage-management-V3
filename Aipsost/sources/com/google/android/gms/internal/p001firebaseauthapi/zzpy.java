package com.google.android.gms.internal.p001firebaseauthapi;

import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzpy implements zzap {
    private final zzqk zza;
    private final zzbm zzb;
    private final int zzc;

    public zzpy(zzqk zzqkVar, zzbm zzbmVar, int i) {
        this.zza = zzqkVar;
        this.zzb = zzbmVar;
        this.zzc = i;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzap
    public final byte[] zza(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        int length = bArr.length;
        int i = this.zzc;
        if (length < i) {
            throw new GeneralSecurityException("ciphertext too short");
        }
        byte[] bArrCopyOfRange = Arrays.copyOfRange(bArr, 0, length - i);
        this.zzb.zza(Arrays.copyOfRange(bArr, length - this.zzc, length), zzpp.zzc(bArr2, bArrCopyOfRange, Arrays.copyOf(ByteBuffer.allocate(8).putLong(0L).array(), 8)));
        return this.zza.zza(bArrCopyOfRange);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzap
    public final byte[] zzb(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        throw null;
    }
}
