package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import java.security.Key;
import java.util.Arrays;
import javax.crypto.Mac;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzqn implements zzjk {
    private final ThreadLocal zza;
    private final String zzb;
    private final Key zzc;
    private final int zzd;

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:24:0x0057  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public zzqn(java.lang.String r4, java.security.Key r5) throws java.security.GeneralSecurityException {
        /*
            r3 = this;
            r3.<init>()
            com.google.android.gms.internal.firebase-auth-api.zzqm r0 = new com.google.android.gms.internal.firebase-auth-api.zzqm
            r0.<init>(r3)
            r3.zza = r0
            r1 = 2
            boolean r2 = com.google.android.gms.internal.p001firebaseauthapi.zzdv.zza(r1)
            if (r2 == 0) goto L86
            r3.zzb = r4
            r3.zzc = r5
            byte[] r5 = r5.getEncoded()
            int r5 = r5.length
            r2 = 16
            if (r5 < r2) goto L7e
            int r5 = r4.hashCode()
            switch(r5) {
                case -1823053428: goto L4d;
                case 392315023: goto L43;
                case 392315118: goto L3a;
                case 392316170: goto L30;
                case 392317873: goto L26;
                default: goto L25;
            }
        L25:
            goto L57
        L26:
            java.lang.String r5 = "HMACSHA512"
            boolean r5 = r4.equals(r5)
            if (r5 == 0) goto L57
            r1 = 4
            goto L58
        L30:
            java.lang.String r5 = "HMACSHA384"
            boolean r5 = r4.equals(r5)
            if (r5 == 0) goto L57
            r1 = 3
            goto L58
        L3a:
            java.lang.String r5 = "HMACSHA256"
            boolean r5 = r4.equals(r5)
            if (r5 == 0) goto L57
            goto L58
        L43:
            java.lang.String r5 = "HMACSHA224"
            boolean r5 = r4.equals(r5)
            if (r5 == 0) goto L57
            r1 = 1
            goto L58
        L4d:
            java.lang.String r5 = "HMACSHA1"
            boolean r5 = r4.equals(r5)
            if (r5 == 0) goto L57
            r1 = 0
            goto L58
        L57:
            r1 = -1
        L58:
            switch(r1) {
                case 0: goto L75;
                case 1: goto L70;
                case 2: goto L6d;
                case 3: goto L6a;
                case 4: goto L67;
                default: goto L5b;
            }
        L5b:
            java.security.NoSuchAlgorithmException r5 = new java.security.NoSuchAlgorithmException
            java.lang.String r0 = "unknown Hmac algorithm: "
            java.lang.String r4 = r0.concat(r4)
            r5.<init>(r4)
            throw r5
        L67:
            r4 = 64
            goto L72
        L6a:
            r4 = 48
            goto L72
        L6d:
            r4 = 32
            goto L72
        L70:
            r4 = 28
        L72:
            r3.zzd = r4
            goto L79
        L75:
            r4 = 20
            r3.zzd = r4
        L79:
            r0.get()
            return
        L7e:
            java.security.InvalidAlgorithmParameterException r4 = new java.security.InvalidAlgorithmParameterException
            java.lang.String r5 = "key size too small, need at least 16 bytes"
            r4.<init>(r5)
            throw r4
        L86:
            java.security.GeneralSecurityException r4 = new java.security.GeneralSecurityException
            java.lang.String r5 = "Can not use HMAC in FIPS-mode, as BoringCrypto module is not available."
            r4.<init>(r5)
            throw r4
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzqn.<init>(java.lang.String, java.security.Key):void");
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzjk
    public final byte[] zza(byte[] bArr, int i) throws GeneralSecurityException {
        if (i > this.zzd) {
            throw new InvalidAlgorithmParameterException("tag size too big");
        }
        ((Mac) this.zza.get()).update(bArr);
        return Arrays.copyOf(((Mac) this.zza.get()).doFinal(), i);
    }
}
