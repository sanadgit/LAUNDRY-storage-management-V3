package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzes {
    private final String zza;

    zzes(String str) {
        this.zza = str;
    }

    private final byte[] zzf(byte[] bArr, byte[] bArr2, int i) throws GeneralSecurityException {
        Mac mac = (Mac) zzpz.zzb.zza(this.zza);
        if (i > mac.getMacLength() * 255) {
            throw new GeneralSecurityException("size too large");
        }
        byte[] bArr3 = new byte[i];
        mac.init(new SecretKeySpec(bArr, this.zza));
        byte[] bArrDoFinal = new byte[0];
        int i2 = 1;
        int i3 = 0;
        while (true) {
            mac.update(bArrDoFinal);
            mac.update(bArr2);
            mac.update((byte) i2);
            bArrDoFinal = mac.doFinal();
            int length = bArrDoFinal.length;
            int i4 = i3 + length;
            if (i4 >= i) {
                System.arraycopy(bArrDoFinal, 0, bArr3, i3, i - i3);
                return bArr3;
            }
            System.arraycopy(bArrDoFinal, 0, bArr3, i3, length);
            i2++;
            i3 = i4;
        }
    }

    private final byte[] zzg(byte[] bArr, byte[] bArr2) throws GeneralSecurityException {
        Mac mac = (Mac) zzpz.zzb.zza(this.zza);
        if (bArr2 == null || bArr2.length == 0) {
            mac.init(new SecretKeySpec(new byte[mac.getMacLength()], this.zza));
        } else {
            mac.init(new SecretKeySpec(bArr2, this.zza));
        }
        return mac.doFinal(bArr);
    }

    final int zza() throws GeneralSecurityException {
        return Mac.getInstance(this.zza).getMacLength();
    }

    public final byte[] zzb(byte[] bArr, byte[] bArr2, String str, byte[] bArr3, String str2, byte[] bArr4, int i) throws GeneralSecurityException {
        return zzf(zzg(zzff.zze("eae_prk", bArr2, bArr4), null), zzff.zzf("shared_secret", bArr3, bArr4, i), i);
    }

    public final byte[] zzd(byte[] bArr, byte[] bArr2, String str, byte[] bArr3, int i) throws GeneralSecurityException {
        return zzf(bArr, zzff.zzf(str, bArr2, bArr3, i), i);
    }

    public final byte[] zze(byte[] bArr, byte[] bArr2, String str, byte[] bArr3) throws GeneralSecurityException {
        return zzg(zzff.zze(str, bArr2, bArr3), bArr);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:14:0x0028  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final byte[] zzc() throws java.security.GeneralSecurityException {
        /*
            r2 = this;
            java.lang.String r0 = r2.zza
            int r1 = r0.hashCode()
            switch(r1) {
                case 984523022: goto L1e;
                case 984524074: goto L14;
                case 984525777: goto La;
                default: goto L9;
            }
        L9:
            goto L28
        La:
            java.lang.String r1 = "HmacSha512"
            boolean r0 = r0.equals(r1)
            if (r0 == 0) goto L28
            r0 = 2
            goto L29
        L14:
            java.lang.String r1 = "HmacSha384"
            boolean r0 = r0.equals(r1)
            if (r0 == 0) goto L28
            r0 = 1
            goto L29
        L1e:
            java.lang.String r1 = "HmacSha256"
            boolean r0 = r0.equals(r1)
            if (r0 == 0) goto L28
            r0 = 0
            goto L29
        L28:
            r0 = -1
        L29:
            switch(r0) {
                case 0: goto L3a;
                case 1: goto L37;
                case 2: goto L34;
                default: goto L2c;
            }
        L2c:
            java.security.GeneralSecurityException r0 = new java.security.GeneralSecurityException
            java.lang.String r1 = "Could not determine HPKE KDF ID"
            r0.<init>(r1)
            throw r0
        L34:
            byte[] r0 = com.google.android.gms.internal.p001firebaseauthapi.zzff.zzh
            return r0
        L37:
            byte[] r0 = com.google.android.gms.internal.p001firebaseauthapi.zzff.zzg
            return r0
        L3a:
            byte[] r0 = com.google.android.gms.internal.p001firebaseauthapi.zzff.zzf
            return r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzes.zzc():byte[]");
    }
}
