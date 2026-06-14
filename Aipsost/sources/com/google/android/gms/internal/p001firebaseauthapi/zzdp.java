package com.google.android.gms.internal.p001firebaseauthapi;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.security.GeneralSecurityException;
import java.security.InvalidKeyException;
import javax.crypto.AEADBadTagException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzdp {
    private final zzdn zza;
    private final zzdn zzb;

    public zzdp(byte[] bArr) throws GeneralSecurityException {
        if (!zzdv.zza(1)) {
            throw new GeneralSecurityException("Can not use ChaCha20Poly1305 in FIPS-mode.");
        }
        this.zza = zza(bArr, 1);
        this.zzb = zza(bArr, 0);
    }

    abstract zzdn zza(byte[] bArr, int i) throws InvalidKeyException;

    public final byte[] zzb(ByteBuffer byteBuffer, byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        if (byteBuffer.remaining() < 16) {
            throw new GeneralSecurityException("ciphertext too short");
        }
        int iPosition = byteBuffer.position();
        byte[] bArr3 = new byte[16];
        byteBuffer.position(byteBuffer.limit() - 16);
        byteBuffer.get(bArr3);
        byteBuffer.position(iPosition);
        byteBuffer.limit(byteBuffer.limit() - 16);
        try {
            byte[] bArr4 = new byte[32];
            this.zzb.zzc(bArr, 0).get(bArr4);
            int iRemaining = byteBuffer.remaining();
            int i = iRemaining % 16;
            int i2 = i == 0 ? iRemaining : (iRemaining + 16) - i;
            ByteBuffer byteBufferOrder = ByteBuffer.allocate(i2 + 16).order(ByteOrder.LITTLE_ENDIAN);
            byteBufferOrder.put(bArr2);
            byteBufferOrder.position(0);
            byteBufferOrder.put(byteBuffer);
            byteBufferOrder.position(i2);
            byteBufferOrder.putLong(0L);
            byteBufferOrder.putLong(iRemaining);
            if (!zzpp.zzb(zzds.zza(bArr4, byteBufferOrder.array()), bArr3)) {
                throw new GeneralSecurityException("invalid MAC");
            }
            byteBuffer.position(iPosition);
            return this.zza.zzd(bArr, byteBuffer);
        } catch (GeneralSecurityException e) {
            throw new AEADBadTagException(e.toString());
        }
    }

    public final byte[] zzc(byte[] bArr, byte[] bArr2, byte[] bArr3) throws GeneralSecurityException {
        return zzb(ByteBuffer.wrap(bArr2), bArr, bArr3);
    }
}
