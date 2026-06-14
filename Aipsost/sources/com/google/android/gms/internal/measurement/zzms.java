package com.google.android.gms.internal.measurement;

import com.aipsoft.aipsoftconnect.Service.PrinterCommands;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzms {
    static /* synthetic */ boolean zza(byte b) {
        return b >= 0;
    }

    static /* synthetic */ void zzb(byte b, byte b2, char[] cArr, int i) throws zzkn {
        if (b < -62 || zze(b2)) {
            throw zzkn.zzf();
        }
        cArr[i] = (char) (((b & PrinterCommands.US) << 6) | (b2 & 63));
    }

    static /* synthetic */ void zzd(byte b, byte b2, byte b3, byte b4, char[] cArr, int i) throws zzkn {
        if (zze(b2) || (((b << PrinterCommands.FS) + (b2 + 112)) >> 30) != 0 || zze(b3) || zze(b4)) {
            throw zzkn.zzf();
        }
        int i2 = ((b & 7) << 18) | ((b2 & 63) << 12) | ((b3 & 63) << 6) | (b4 & 63);
        cArr[i] = (char) ((i2 >>> 10) + 55232);
        cArr[i + 1] = (char) ((i2 & 1023) + 56320);
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
    static /* synthetic */ void zzc(byte r2, byte r3, byte r4, char[] r5, int r6) throws com.google.android.gms.internal.measurement.zzkn {
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
            com.google.android.gms.internal.measurement.zzkn r2 = com.google.android.gms.internal.measurement.zzkn.zzf()
            throw r2
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.measurement.zzms.zzc(byte, byte, byte, char[], int):void");
    }
}
