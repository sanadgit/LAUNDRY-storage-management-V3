package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.interfaces.ECPrivateKey;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzpv {
    private final ECPrivateKey zza;

    public zzpv(ECPrivateKey eCPrivateKey) {
        this.zza = eCPrivateKey;
    }

    public final byte[] zza(byte[] bArr, String str, byte[] bArr2, byte[] bArr3, int i, int i2) throws GeneralSecurityException {
        byte[] bArrZzh = zzpx.zzh(this.zza, zzpx.zzk(this.zza.getParams(), i2, bArr));
        int i3 = 1;
        byte[] bArrZzc = zzpp.zzc(bArr, bArrZzh);
        Mac mac = (Mac) zzpz.zzb.zza(str);
        if (i > mac.getMacLength() * 255) {
            throw new GeneralSecurityException("size too large");
        }
        if (bArr2 == null || bArr2.length == 0) {
            mac.init(new SecretKeySpec(new byte[mac.getMacLength()], str));
        } else {
            mac.init(new SecretKeySpec(bArr2, str));
        }
        byte[] bArrDoFinal = mac.doFinal(bArrZzc);
        byte[] bArr4 = new byte[i];
        mac.init(new SecretKeySpec(bArrDoFinal, str));
        byte[] bArrDoFinal2 = new byte[0];
        int i4 = 0;
        while (true) {
            mac.update(bArrDoFinal2);
            mac.update((byte[]) null);
            mac.update((byte) i3);
            bArrDoFinal2 = mac.doFinal();
            int length = bArrDoFinal2.length;
            int i5 = i4 + length;
            if (i5 >= i) {
                System.arraycopy(bArrDoFinal2, 0, bArr4, i4, i - i4);
                return bArr4;
            }
            System.arraycopy(bArrDoFinal2, 0, bArr4, i4, length);
            i3++;
            i4 = i5;
        }
    }
}
