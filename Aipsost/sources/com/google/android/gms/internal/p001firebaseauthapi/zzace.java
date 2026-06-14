package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;
import java.util.Arrays;
import kotlin.UByte;
import kotlin.jvm.internal.ByteCompanionObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzace extends zzacg {
    private final byte[] zze;
    private int zzf;
    private int zzg;
    private int zzh;
    private int zzi;
    private int zzj;

    /* synthetic */ zzace(byte[] bArr, int i, int i2, boolean z, zzacd zzacdVar) {
        super(null);
        this.zzj = Integer.MAX_VALUE;
        this.zze = bArr;
        this.zzf = i2;
        this.zzh = 0;
    }

    private final void zzv() {
        int i = this.zzf + this.zzg;
        this.zzf = i;
        int i2 = this.zzj;
        if (i <= i2) {
            this.zzg = 0;
            return;
        }
        int i3 = i - i2;
        this.zzg = i3;
        this.zzf = i - i3;
    }

    public final byte zza() throws IOException {
        int i = this.zzh;
        if (i == this.zzf) {
            throw zzadn.zzi();
        }
        byte[] bArr = this.zze;
        this.zzh = i + 1;
        return bArr[i];
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final int zzb() {
        return this.zzh;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final int zzc(int i) throws zzadn {
        if (i < 0) {
            throw zzadn.zzf();
        }
        int i2 = i + this.zzh;
        if (i2 < 0) {
            throw zzadn.zzg();
        }
        int i3 = this.zzj;
        if (i2 > i3) {
            throw zzadn.zzi();
        }
        this.zzj = i2;
        zzv();
        return i3;
    }

    public final int zzd() throws IOException {
        int i = this.zzh;
        if (this.zzf - i < 4) {
            throw zzadn.zzi();
        }
        byte[] bArr = this.zze;
        this.zzh = i + 4;
        return ((bArr[i + 3] & UByte.MAX_VALUE) << 24) | (bArr[i] & UByte.MAX_VALUE) | ((bArr[i + 1] & UByte.MAX_VALUE) << 8) | ((bArr[i + 2] & UByte.MAX_VALUE) << 16);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final int zzf() throws IOException {
        if (zzp()) {
            this.zzi = 0;
            return 0;
        }
        int iZze = zze();
        this.zzi = iZze;
        if ((iZze >>> 3) != 0) {
            return iZze;
        }
        throw zzadn.zzc();
    }

    public final long zzg() throws IOException {
        int i = this.zzh;
        if (this.zzf - i < 8) {
            throw zzadn.zzi();
        }
        byte[] bArr = this.zze;
        this.zzh = i + 8;
        return ((((long) bArr[i + 7]) & 255) << 56) | (((long) bArr[i]) & 255) | ((((long) bArr[i + 1]) & 255) << 8) | ((((long) bArr[i + 2]) & 255) << 16) | ((((long) bArr[i + 3]) & 255) << 24) | ((((long) bArr[i + 4]) & 255) << 32) | ((((long) bArr[i + 5]) & 255) << 40) | ((((long) bArr[i + 6]) & 255) << 48);
    }

    final long zzi() throws IOException {
        long j = 0;
        for (int i = 0; i < 64; i += 7) {
            byte bZza = zza();
            j |= ((long) (bZza & ByteCompanionObject.MAX_VALUE)) << i;
            if ((bZza & ByteCompanionObject.MIN_VALUE) == 0) {
                return j;
            }
        }
        throw zzadn.zze();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final zzacc zzj() throws IOException {
        int iZze = zze();
        if (iZze > 0) {
            int i = this.zzf;
            int i2 = this.zzh;
            if (iZze <= i - i2) {
                zzacc zzaccVarZzo = zzacc.zzo(this.zze, i2, iZze);
                this.zzh += iZze;
                return zzaccVarZzo;
            }
        }
        if (iZze == 0) {
            return zzacc.zzb;
        }
        if (iZze > 0) {
            int i3 = this.zzf;
            int i4 = this.zzh;
            if (iZze <= i3 - i4) {
                int i5 = iZze + i4;
                this.zzh = i5;
                return zzacc.zzq(Arrays.copyOfRange(this.zze, i4, i5));
            }
        }
        if (iZze <= 0) {
            throw zzadn.zzf();
        }
        throw zzadn.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final String zzk() throws IOException {
        int iZze = zze();
        if (iZze > 0) {
            int i = this.zzf;
            int i2 = this.zzh;
            if (iZze <= i - i2) {
                String str = new String(this.zze, i2, iZze, zzadl.zzb);
                this.zzh += iZze;
                return str;
            }
        }
        if (iZze == 0) {
            return "";
        }
        if (iZze < 0) {
            throw zzadn.zzf();
        }
        throw zzadn.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final String zzl() throws IOException {
        int iZze = zze();
        if (iZze > 0) {
            int i = this.zzf;
            int i2 = this.zzh;
            if (iZze <= i - i2) {
                String strZzd = zzagc.zzd(this.zze, i2, iZze);
                this.zzh += iZze;
                return strZzd;
            }
        }
        if (iZze == 0) {
            return "";
        }
        if (iZze <= 0) {
            throw zzadn.zzf();
        }
        throw zzadn.zzi();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final void zzm(int i) throws zzadn {
        if (this.zzi != i) {
            throw zzadn.zzb();
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final void zzn(int i) {
        this.zzj = i;
        zzv();
    }

    public final void zzo(int i) throws IOException {
        if (i >= 0) {
            int i2 = this.zzf;
            int i3 = this.zzh;
            if (i <= i2 - i3) {
                this.zzh = i3 + i;
                return;
            }
        }
        if (i >= 0) {
            throw zzadn.zzi();
        }
        throw zzadn.zzf();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final boolean zzp() throws IOException {
        return this.zzh == this.zzf;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final boolean zzq() throws IOException {
        return zzh() != 0;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzacg
    public final boolean zzr(int i) throws IOException {
        int iZzf;
        int i2 = 0;
        switch (i & 7) {
            case 0:
                if (this.zzf - this.zzh < 10) {
                    while (i2 < 10) {
                        if (zza() < 0) {
                            i2++;
                        }
                    }
                    throw zzadn.zze();
                }
                while (i2 < 10) {
                    byte[] bArr = this.zze;
                    int i3 = this.zzh;
                    this.zzh = i3 + 1;
                    if (bArr[i3] < 0) {
                        i2++;
                    }
                }
                throw zzadn.zze();
                return true;
            case 1:
                zzo(8);
                return true;
            case 2:
                zzo(zze());
                return true;
            case 3:
                break;
            case 4:
                return false;
            case 5:
                zzo(4);
                return true;
            default:
                throw zzadn.zza();
        }
        do {
            iZzf = zzf();
            if (iZzf != 0) {
            }
            zzm(((i >>> 3) << 3) | 4);
            return true;
        } while (zzr(iZzf));
        zzm(((i >>> 3) << 3) | 4);
        return true;
    }

    /* JADX WARN: Code restructure failed: missing block: B:31:0x0068, code lost:
    
        if (r2[r3] >= 0) goto L34;
     */
    /* JADX WARN: Removed duplicated region for block: B:33:0x006b A[PHI: r3
  0x006b: PHI (r3v7 int) = (r3v6 int), (r3v9 int), (r3v11 int) binds: [B:21:0x004a, B:25:0x0056, B:29:0x0062] A[DONT_GENERATE, DONT_INLINE]] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final int zze() throws java.io.IOException {
        /*
            r5 = this;
            int r0 = r5.zzh
            int r1 = r5.zzf
            if (r1 != r0) goto L8
            goto L6f
        L8:
            byte[] r2 = r5.zze
            int r3 = r0 + 1
            r0 = r2[r0]
            if (r0 < 0) goto L13
            r5.zzh = r3
            return r0
        L13:
            int r1 = r1 - r3
            r4 = 9
            if (r1 < r4) goto L6f
            int r1 = r3 + 1
            r3 = r2[r3]
            int r3 = r3 << 7
            r0 = r0 ^ r3
            if (r0 >= 0) goto L24
            r0 = r0 ^ (-128(0xffffffffffffff80, float:NaN))
            goto L6c
        L24:
            int r3 = r1 + 1
            r1 = r2[r1]
            int r1 = r1 << 14
            r0 = r0 ^ r1
            if (r0 < 0) goto L31
            r0 = r0 ^ 16256(0x3f80, float:2.278E-41)
            r1 = r3
            goto L6c
        L31:
            int r1 = r3 + 1
            r3 = r2[r3]
            int r3 = r3 << 21
            r0 = r0 ^ r3
            if (r0 >= 0) goto L3f
            r2 = -2080896(0xffffffffffe03f80, float:NaN)
            r0 = r0 ^ r2
            goto L6c
        L3f:
            int r3 = r1 + 1
            r1 = r2[r1]
            int r4 = r1 << 28
            r0 = r0 ^ r4
            r4 = 266354560(0xfe03f80, float:2.2112565E-29)
            r0 = r0 ^ r4
            if (r1 >= 0) goto L6b
            int r1 = r3 + 1
            r3 = r2[r3]
            if (r3 >= 0) goto L6c
            int r3 = r1 + 1
            r1 = r2[r1]
            if (r1 >= 0) goto L6b
            int r1 = r3 + 1
            r3 = r2[r3]
            if (r3 >= 0) goto L6c
            int r3 = r1 + 1
            r1 = r2[r1]
            if (r1 >= 0) goto L6b
            int r1 = r3 + 1
            r2 = r2[r3]
            if (r2 < 0) goto L6f
            goto L6c
        L6b:
            r1 = r3
        L6c:
            r5.zzh = r1
            return r0
        L6f:
            long r0 = r5.zzi()
            int r1 = (int) r0
            return r1
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzace.zze():int");
    }

    public final long zzh() throws IOException {
        long j;
        int i = this.zzh;
        int i2 = this.zzf;
        if (i2 != i) {
            byte[] bArr = this.zze;
            int i3 = i + 1;
            byte b = bArr[i];
            if (b >= 0) {
                this.zzh = i3;
                return b;
            }
            if (i2 - i3 >= 9) {
                int i4 = i3 + 1;
                int i5 = b ^ (bArr[i3] << 7);
                if (i5 < 0) {
                    j = i5 ^ (-128);
                } else {
                    int i6 = i4 + 1;
                    int i7 = i5 ^ (bArr[i4] << 14);
                    if (i7 >= 0) {
                        i4 = i6;
                        j = i7 ^ 16256;
                    } else {
                        i4 = i6 + 1;
                        int i8 = i7 ^ (bArr[i6] << 21);
                        if (i8 < 0) {
                            j = i8 ^ (-2080896);
                        } else {
                            int i9 = i4 + 1;
                            long j2 = (((long) bArr[i4]) << 28) ^ ((long) i8);
                            if (j2 >= 0) {
                                i4 = i9;
                                j = j2 ^ 266354560;
                            } else {
                                int i10 = i9 + 1;
                                long j3 = j2 ^ (((long) bArr[i9]) << 35);
                                if (j3 < 0) {
                                    j = (-34093383808L) ^ j3;
                                    i4 = i10;
                                } else {
                                    int i11 = i10 + 1;
                                    long j4 = j3 ^ (((long) bArr[i10]) << 42);
                                    if (j4 >= 0) {
                                        i4 = i11;
                                        j = j4 ^ 4363953127296L;
                                    } else {
                                        int i12 = i11 + 1;
                                        long j5 = j4 ^ (((long) bArr[i11]) << 49);
                                        if (j5 < 0) {
                                            j = (-558586000294016L) ^ j5;
                                            i4 = i12;
                                        } else {
                                            int i13 = i12 + 1;
                                            long j6 = (j5 ^ (((long) bArr[i12]) << 56)) ^ 71499008037633920L;
                                            if (j6 < 0) {
                                                int i14 = i13 + 1;
                                                if (bArr[i13] >= 0) {
                                                    j = j6;
                                                    i4 = i14;
                                                }
                                            } else {
                                                i4 = i13;
                                                j = j6;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                this.zzh = i4;
                return j;
            }
        }
        return zzi();
    }
}
