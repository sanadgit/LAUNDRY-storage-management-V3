package com.google.android.gms.internal.p001firebaseauthapi;

import com.aipsoft.aipsoftconnect.Service.PrinterCommands;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzagc {
    private static final zzafz zza;

    static {
        if (zzafx.zzx() && zzafx.zzy()) {
            int i = zzabo.zza;
        }
        zza = new zzaga();
    }

    static /* bridge */ /* synthetic */ int zza(byte[] bArr, int i, int i2) {
        byte b = bArr[i - 1];
        switch (i2 - i) {
            case 0:
                if (b > -12) {
                    return -1;
                }
                return b;
            case 1:
                byte b2 = bArr[i];
                if (b > -12 || b2 > -65) {
                    return -1;
                }
                return b ^ (b2 << 8);
            case 2:
                byte b3 = bArr[i];
                byte b4 = bArr[i + 1];
                if (b <= -12 && b3 <= -65 && b4 <= -65) {
                    return ((b3 << 8) ^ b) ^ (b4 << PrinterCommands.DLE);
                }
                return -1;
            default:
                throw new AssertionError();
        }
    }

    static int zzb(CharSequence charSequence, byte[] bArr, int i, int i2) {
        int i3;
        int i4;
        char cCharAt;
        int length = charSequence.length();
        int i5 = i2 + i;
        int i6 = 0;
        while (i6 < length && (i4 = i6 + i) < i5 && (cCharAt = charSequence.charAt(i6)) < 128) {
            bArr[i4] = (byte) cCharAt;
            i6++;
        }
        if (i6 == length) {
            return i + length;
        }
        int i7 = i + i6;
        while (i6 < length) {
            char cCharAt2 = charSequence.charAt(i6);
            if (cCharAt2 < 128 && i7 < i5) {
                bArr[i7] = (byte) cCharAt2;
                i7++;
            } else if (cCharAt2 < 2048 && i7 <= i5 - 2) {
                int i8 = i7 + 1;
                bArr[i7] = (byte) ((cCharAt2 >>> 6) | 960);
                i7 = i8 + 1;
                bArr[i8] = (byte) ((cCharAt2 & '?') | 128);
            } else {
                if ((cCharAt2 >= 55296 && cCharAt2 <= 57343) || i7 > i5 - 3) {
                    if (i7 > i5 - 4) {
                        if (cCharAt2 >= 55296 && cCharAt2 <= 57343 && ((i3 = i6 + 1) == charSequence.length() || !Character.isSurrogatePair(cCharAt2, charSequence.charAt(i3)))) {
                            throw new zzagb(i6, length);
                        }
                        throw new ArrayIndexOutOfBoundsException("Failed writing " + cCharAt2 + " at index " + i7);
                    }
                    int i9 = i6 + 1;
                    if (i9 != charSequence.length()) {
                        char cCharAt3 = charSequence.charAt(i9);
                        if (Character.isSurrogatePair(cCharAt2, cCharAt3)) {
                            int codePoint = Character.toCodePoint(cCharAt2, cCharAt3);
                            int i10 = i7 + 1;
                            bArr[i7] = (byte) ((codePoint >>> 18) | 240);
                            int i11 = i10 + 1;
                            bArr[i10] = (byte) (((codePoint >>> 12) & 63) | 128);
                            int i12 = i11 + 1;
                            bArr[i11] = (byte) (((codePoint >>> 6) & 63) | 128);
                            i7 = i12 + 1;
                            bArr[i12] = (byte) ((codePoint & 63) | 128);
                            i6 = i9;
                        } else {
                            i6 = i9;
                        }
                    }
                    throw new zzagb(i6 - 1, length);
                }
                int i13 = i7 + 1;
                bArr[i7] = (byte) ((cCharAt2 >>> '\f') | 480);
                int i14 = i13 + 1;
                bArr[i13] = (byte) (((cCharAt2 >>> 6) & 63) | 128);
                bArr[i14] = (byte) ((cCharAt2 & '?') | 128);
                i7 = i14 + 1;
            }
            i6++;
        }
        return i7;
    }

    static int zzc(CharSequence charSequence) {
        int length = charSequence.length();
        int i = 0;
        int i2 = 0;
        while (i2 < length && charSequence.charAt(i2) < 128) {
            i2++;
        }
        int i3 = length;
        while (true) {
            if (i2 >= length) {
                break;
            }
            char cCharAt = charSequence.charAt(i2);
            if (cCharAt < 2048) {
                i3 += (127 - cCharAt) >>> 31;
                i2++;
            } else {
                int length2 = charSequence.length();
                while (i2 < length2) {
                    char cCharAt2 = charSequence.charAt(i2);
                    if (cCharAt2 < 2048) {
                        i += (127 - cCharAt2) >>> 31;
                    } else {
                        i += 2;
                        if (cCharAt2 >= 55296 && cCharAt2 <= 57343) {
                            if (Character.codePointAt(charSequence, i2) < 65536) {
                                throw new zzagb(i2, length2);
                            }
                            i2++;
                        }
                    }
                    i2++;
                }
                i3 += i;
            }
        }
        if (i3 >= length) {
            return i3;
        }
        throw new IllegalArgumentException("UTF-8 length does not fit in int: " + (((long) i3) + 4294967296L));
    }

    static String zzd(byte[] bArr, int i, int i2) throws zzadn {
        int length = bArr.length;
        if ((i | i2 | ((length - i) - i2)) < 0) {
            throw new ArrayIndexOutOfBoundsException(String.format("buffer length=%d, index=%d, size=%d", Integer.valueOf(length), Integer.valueOf(i), Integer.valueOf(i2)));
        }
        int i3 = i + i2;
        char[] cArr = new char[i2];
        int i4 = 0;
        while (i < i3) {
            byte b = bArr[i];
            if (!zzafy.zzd(b)) {
                break;
            }
            i++;
            cArr[i4] = (char) b;
            i4++;
        }
        while (i < i3) {
            int i5 = i + 1;
            byte b2 = bArr[i];
            if (zzafy.zzd(b2)) {
                cArr[i4] = (char) b2;
                i = i5;
                i4++;
                while (i < i3) {
                    byte b3 = bArr[i];
                    if (!zzafy.zzd(b3)) {
                        break;
                    }
                    i++;
                    cArr[i4] = (char) b3;
                    i4++;
                }
            } else if (b2 < -32) {
                if (i5 >= i3) {
                    throw zzadn.zzd();
                }
                zzafy.zzc(b2, bArr[i5], cArr, i4);
                i = i5 + 1;
                i4++;
            } else if (b2 < -16) {
                if (i5 >= i3 - 1) {
                    throw zzadn.zzd();
                }
                int i6 = i5 + 1;
                zzafy.zzb(b2, bArr[i5], bArr[i6], cArr, i4);
                i = i6 + 1;
                i4++;
            } else {
                if (i5 >= i3 - 2) {
                    throw zzadn.zzd();
                }
                int i7 = i5 + 1;
                int i8 = i7 + 1;
                zzafy.zza(b2, bArr[i5], bArr[i7], bArr[i8], cArr, i4);
                i4 += 2;
                i = i8 + 1;
            }
        }
        return new String(cArr, 0, i4);
    }

    static boolean zze(byte[] bArr) {
        return zza.zzb(bArr, 0, bArr.length);
    }

    static boolean zzf(byte[] bArr, int i, int i2) {
        return zza.zzb(bArr, i, i2);
    }
}
