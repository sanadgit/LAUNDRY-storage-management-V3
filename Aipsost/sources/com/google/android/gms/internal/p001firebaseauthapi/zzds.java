package com.google.android.gms.internal.p001firebaseauthapi;

import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import java.util.Arrays;
import kotlin.UByte;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzds {
    public static byte[] zza(byte[] bArr, byte[] bArr2) {
        long jZzb = zzb(bArr, 0, 0);
        long jZzb2 = zzb(bArr, 3, 2) & 67108611;
        long jZzb3 = zzb(bArr, 6, 4) & 67092735;
        long jZzb4 = zzb(bArr, 9, 6) & 66076671;
        long jZzb5 = zzb(bArr, 12, 8) & 1048575;
        long j = jZzb2 * 5;
        long j2 = jZzb3 * 5;
        long j3 = jZzb4 * 5;
        long j4 = jZzb5 * 5;
        int i = 17;
        byte[] bArr3 = new byte[17];
        long j5 = 0;
        long j6 = 0;
        long j7 = 0;
        long j8 = 0;
        long j9 = 0;
        int i2 = 0;
        while (true) {
            int length = bArr2.length;
            if (i2 >= length) {
                long j10 = j5 + (j6 >> 26);
                long j11 = j10 & 67108863;
                long j12 = j7 + (j10 >> 26);
                long j13 = j12 & 67108863;
                long j14 = j8 + (j12 >> 26);
                long j15 = j14 & 67108863;
                long j16 = j9 + ((j14 >> 26) * 5);
                long j17 = j16 & 67108863;
                long j18 = (j6 & 67108863) + (j16 >> 26);
                long j19 = j17 + 5;
                long j20 = (j19 >> 26) + j18;
                long j21 = j11 + (j20 >> 26);
                long j22 = j13 + (j21 >> 26);
                long j23 = (j15 + (j22 >> 26)) - 67108864;
                long j24 = j23 >> 63;
                long j25 = ~j24;
                long j26 = (j18 & j24) | (j20 & 67108863 & j25);
                long j27 = (j11 & j24) | (j21 & 67108863 & j25);
                long j28 = (j13 & j24) | (j22 & 67108863 & j25);
                long jZzc = (((j17 & j24) | (j19 & 67108863 & j25) | (j26 << 26)) & 4294967295L) + zzc(bArr, 16);
                long jZzc2 = (((j26 >> 6) | (j27 << 20)) & 4294967295L) + zzc(bArr, 20) + (jZzc >> 32);
                long jZzc3 = (((j27 >> 12) | (j28 << 14)) & 4294967295L) + zzc(bArr, 24) + (jZzc2 >> 32);
                long jZzc4 = zzc(bArr, 28);
                byte[] bArr4 = new byte[16];
                zzd(bArr4, jZzc & 4294967295L, 0);
                zzd(bArr4, jZzc2 & 4294967295L, 4);
                zzd(bArr4, jZzc3 & 4294967295L, 8);
                zzd(bArr4, ((((((j23 & j25) | (j15 & j24)) << 8) | (j28 >> 18)) & 4294967295L) + jZzc4 + (jZzc3 >> 32)) & 4294967295L, 12);
                return bArr4;
            }
            int iMin = Math.min(16, length - i2);
            System.arraycopy(bArr2, i2, bArr3, 0, iMin);
            bArr3[iMin] = 1;
            if (iMin != 16) {
                Arrays.fill(bArr3, iMin + 1, i, (byte) 0);
            }
            long jZzb6 = j9 + zzb(bArr3, 0, 0);
            long jZzb7 = j6 + zzb(bArr3, 3, 2);
            long jZzb8 = j5 + zzb(bArr3, 6, 4);
            long jZzb9 = j7 + zzb(bArr3, 9, 6);
            long jZzb10 = j8 + (zzb(bArr3, 12, 8) | ((long) (bArr3[16] << PrinterCommands.CAN)));
            long j29 = (jZzb6 * jZzb) + (jZzb7 * j4) + (jZzb8 * j3) + (jZzb9 * j2) + (jZzb10 * j);
            long j30 = (jZzb6 * jZzb2) + (jZzb7 * jZzb) + (jZzb8 * j4) + (jZzb9 * j3) + (jZzb10 * j2) + (j29 >> 26);
            long j31 = (jZzb6 * jZzb3) + (jZzb7 * jZzb2) + (jZzb8 * jZzb) + (jZzb9 * j4) + (jZzb10 * j3) + (j30 >> 26);
            long j32 = (jZzb6 * jZzb4) + (jZzb7 * jZzb3) + (jZzb8 * jZzb2) + (jZzb9 * jZzb) + (jZzb10 * j4) + (j31 >> 26);
            long j33 = (jZzb6 * jZzb5) + (jZzb7 * jZzb4) + (jZzb8 * jZzb3) + (jZzb9 * jZzb2) + (jZzb10 * jZzb) + (j32 >> 26);
            j8 = j33 & 67108863;
            long j34 = (j29 & 67108863) + ((j33 >> 26) * 5);
            j9 = j34 & 67108863;
            j6 = (j30 & 67108863) + (j34 >> 26);
            i2 += 16;
            j7 = j32 & 67108863;
            j5 = j31 & 67108863;
            i = 17;
        }
    }

    private static long zzb(byte[] bArr, int i, int i2) {
        return (zzc(bArr, i) >> i2) & 67108863;
    }

    private static long zzc(byte[] bArr, int i) {
        return ((long) (((bArr[i + 3] & UByte.MAX_VALUE) << 24) | (bArr[i] & UByte.MAX_VALUE) | ((bArr[i + 1] & UByte.MAX_VALUE) << 8) | ((bArr[i + 2] & UByte.MAX_VALUE) << 16))) & 4294967295L;
    }

    private static void zzd(byte[] bArr, long j, int i) {
        int i2 = 0;
        while (i2 < 4) {
            bArr[i + i2] = (byte) (255 & j);
            i2++;
            j >>= 8;
        }
    }
}
