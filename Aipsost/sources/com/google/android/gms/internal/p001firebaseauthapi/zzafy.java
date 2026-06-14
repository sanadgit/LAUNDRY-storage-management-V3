package com.google.android.gms.internal.p001firebaseauthapi;

import com.aipsoft.aipsoftconnect.Service.PrinterCommands;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzafy {
    static /* bridge */ /* synthetic */ void zza(byte b, byte b2, byte b3, byte b4, char[] cArr, int i) throws zzadn {
        if (zze(b2) || (((b << PrinterCommands.FS) + (b2 + 112)) >> 30) != 0 || zze(b3) || zze(b4)) {
            throw zzadn.zzd();
        }
        int i2 = ((b & 7) << 18) | ((b2 & 63) << 12) | ((b3 & 63) << 6) | (b4 & 63);
        cArr[i] = (char) ((i2 >>> 10) + 55232);
        cArr[i + 1] = (char) ((i2 & 1023) + 56320);
    }

    static /* bridge */ /* synthetic */ void zzc(byte b, byte b2, char[] cArr, int i) throws zzadn {
        if (b < -62 || zze(b2)) {
            throw zzadn.zzd();
        }
        cArr[i] = (char) (((b & PrinterCommands.US) << 6) | (b2 & 63));
    }

    static /* bridge */ /* synthetic */ boolean zzd(byte b) {
        return b >= 0;
    }

    private static boolean zze(byte b) {
        return b > -65;
    }

    /* JADX WARN: Removed duplicated region for block: B:10:0x0014  */
    /* JADX WARN: Removed duplicated region for block: B:12:0x0018 A[PHI: r2
  0x0018: PHI (r2v3 byte) = (r2v2 byte), (r2v9 byte) binds: [B:9:0x0012, B:11:0x0016] A[DONT_GENERATE, DONT_INLINE]] */
    /* JADX WARN: Removed duplicated region for block: B:14:0x001e  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    static /* bridge */ /* synthetic */ void zzb(byte r2, byte r3, byte r4, char[] r5, int r6) throws com.google.android.gms.internal.p001firebaseauthapi.zzadn {
        /*
            boolean r0 = zze(r3)
            if (r0 != 0) goto L2e
            r0 = -96
            r1 = -32
            if (r2 != r1) goto L10
            if (r3 < r0) goto L2e
            r2 = -32
        L10:
            r1 = -19
            if (r2 != r1) goto L18
            if (r3 >= r0) goto L2e
            r2 = -19
        L18:
            boolean r0 = zze(r4)
            if (r0 != 0) goto L2e
            r2 = r2 & 15
            int r2 = r2 << 12
            r3 = r3 & 63
            int r3 = r3 << 6
            r2 = r2 | r3
            r3 = r4 & 63
            r2 = r2 | r3
            char r2 = (char) r2
            r5[r6] = r2
            return
        L2e:
            com.google.android.gms.internal.firebase-auth-api.zzadn r2 = com.google.android.gms.internal.p001firebaseauthapi.zzadn.zzd()
            throw r2
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzafy.zzb(byte, byte, byte, char[], int):void");
    }
}
