package com.google.android.gms.internal.measurement;

import com.aipsoft.aipsoftconnect.Service.PrinterCommands;
import java.io.IOException;
import kotlin.UByte;
import kotlin.jvm.internal.ByteCompanionObject;
import kotlinx.coroutines.scheduling.WorkQueueKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzis {
    static int zza(byte[] bArr, int i, zzir zzirVar) {
        int i2 = i + 1;
        byte b = bArr[i];
        if (b < 0) {
            return zzb(b, bArr, i2, zzirVar);
        }
        zzirVar.zza = b;
        return i2;
    }

    static int zzb(int i, byte[] bArr, int i2, zzir zzirVar) {
        int i3 = i & WorkQueueKt.MASK;
        int i4 = i2 + 1;
        byte b = bArr[i2];
        if (b >= 0) {
            zzirVar.zza = i3 | (b << 7);
            return i4;
        }
        int i5 = i3 | ((b & ByteCompanionObject.MAX_VALUE) << 7);
        int i6 = i4 + 1;
        byte b2 = bArr[i4];
        if (b2 >= 0) {
            zzirVar.zza = i5 | (b2 << 14);
            return i6;
        }
        int i7 = i5 | ((b2 & ByteCompanionObject.MAX_VALUE) << 14);
        int i8 = i6 + 1;
        byte b3 = bArr[i6];
        if (b3 >= 0) {
            zzirVar.zza = i7 | (b3 << 21);
            return i8;
        }
        int i9 = i7 | ((b3 & ByteCompanionObject.MAX_VALUE) << 21);
        int i10 = i8 + 1;
        byte b4 = bArr[i8];
        if (b4 >= 0) {
            zzirVar.zza = i9 | (b4 << PrinterCommands.FS);
            return i10;
        }
        int i11 = i9 | ((b4 & ByteCompanionObject.MAX_VALUE) << 28);
        while (true) {
            int i12 = i10 + 1;
            if (bArr[i10] >= 0) {
                zzirVar.zza = i11;
                return i12;
            }
            i10 = i12;
        }
    }

    static int zzc(byte[] bArr, int i, zzir zzirVar) {
        int i2 = i + 1;
        long j = bArr[i];
        if (j >= 0) {
            zzirVar.zzb = j;
            return i2;
        }
        int i3 = i2 + 1;
        byte b = bArr[i2];
        long j2 = (j & 127) | (((long) (b & ByteCompanionObject.MAX_VALUE)) << 7);
        int i4 = 7;
        while (b < 0) {
            int i5 = i3 + 1;
            byte b2 = bArr[i3];
            i4 += 7;
            j2 |= ((long) (b2 & ByteCompanionObject.MAX_VALUE)) << i4;
            b = b2;
            i3 = i5;
        }
        zzirVar.zzb = j2;
        return i3;
    }

    static int zzd(byte[] bArr, int i) {
        return ((bArr[i + 3] & UByte.MAX_VALUE) << 24) | (bArr[i] & UByte.MAX_VALUE) | ((bArr[i + 1] & UByte.MAX_VALUE) << 8) | ((bArr[i + 2] & UByte.MAX_VALUE) << 16);
    }

    static long zze(byte[] bArr, int i) {
        return ((((long) bArr[i + 7]) & 255) << 56) | (((long) bArr[i]) & 255) | ((((long) bArr[i + 1]) & 255) << 8) | ((((long) bArr[i + 2]) & 255) << 16) | ((((long) bArr[i + 3]) & 255) << 24) | ((((long) bArr[i + 4]) & 255) << 32) | ((((long) bArr[i + 5]) & 255) << 40) | ((((long) bArr[i + 6]) & 255) << 48);
    }

    static int zzf(byte[] bArr, int i, zzir zzirVar) throws zzkn {
        int iZza = zza(bArr, i, zzirVar);
        int i2 = zzirVar.zza;
        if (i2 < 0) {
            throw zzkn.zzb();
        }
        if (i2 == 0) {
            zzirVar.zzc = "";
            return iZza;
        }
        zzirVar.zzc = new String(bArr, iZza, i2, zzkl.zza);
        return iZza + i2;
    }

    static int zzg(byte[] bArr, int i, zzir zzirVar) throws zzkn {
        int iZza = zza(bArr, i, zzirVar);
        int i2 = zzirVar.zza;
        if (i2 < 0) {
            throw zzkn.zzb();
        }
        if (i2 == 0) {
            zzirVar.zzc = "";
            return iZza;
        }
        zzirVar.zzc = zzmw.zze(bArr, iZza, i2);
        return iZza + i2;
    }

    static int zzh(byte[] bArr, int i, zzir zzirVar) throws zzkn {
        int iZza = zza(bArr, i, zzirVar);
        int i2 = zzirVar.zza;
        if (i2 < 0) {
            throw zzkn.zzb();
        }
        if (i2 > bArr.length - iZza) {
            throw zzkn.zza();
        }
        if (i2 == 0) {
            zzirVar.zzc = zzjd.zzb;
            return iZza;
        }
        zzirVar.zzc = zzjd.zzj(bArr, iZza, i2);
        return iZza + i2;
    }

    static int zzi(zzlt zzltVar, byte[] bArr, int i, int i2, zzir zzirVar) throws IOException {
        int i3;
        int i4 = i + 1;
        int i5 = bArr[i];
        if (i5 < 0) {
            int iZzb = zzb(i5, bArr, i4, zzirVar);
            i5 = zzirVar.zza;
            i3 = iZzb;
        } else {
            i3 = i4;
        }
        if (i5 < 0 || i5 > i2 - i3) {
            throw zzkn.zza();
        }
        Object objZza = zzltVar.zza();
        int i6 = i5 + i3;
        zzltVar.zzh(objZza, bArr, i3, i6, zzirVar);
        zzltVar.zzi(objZza);
        zzirVar.zzc = objZza;
        return i6;
    }

    static int zzj(zzlt zzltVar, byte[] bArr, int i, int i2, int i3, zzir zzirVar) throws IOException {
        zzll zzllVar = (zzll) zzltVar;
        Object objZza = zzllVar.zza();
        int iZzg = zzllVar.zzg(objZza, bArr, i, i2, i3, zzirVar);
        zzllVar.zzi(objZza);
        zzirVar.zzc = objZza;
        return iZzg;
    }

    static int zzk(int i, byte[] bArr, int i2, int i3, zzkk<?> zzkkVar, zzir zzirVar) {
        zzke zzkeVar = (zzke) zzkkVar;
        int iZza = zza(bArr, i2, zzirVar);
        zzkeVar.zzh(zzirVar.zza);
        while (iZza < i3) {
            int iZza2 = zza(bArr, iZza, zzirVar);
            if (i != zzirVar.zza) {
                break;
            }
            iZza = zza(bArr, iZza2, zzirVar);
            zzkeVar.zzh(zzirVar.zza);
        }
        return iZza;
    }

    static int zzl(byte[] bArr, int i, zzkk<?> zzkkVar, zzir zzirVar) throws IOException {
        zzke zzkeVar = (zzke) zzkkVar;
        int iZza = zza(bArr, i, zzirVar);
        int i2 = zzirVar.zza + iZza;
        while (iZza < i2) {
            iZza = zza(bArr, iZza, zzirVar);
            zzkeVar.zzh(zzirVar.zza);
        }
        if (iZza == i2) {
            return iZza;
        }
        throw zzkn.zza();
    }

    static int zzm(zzlt<?> zzltVar, int i, byte[] bArr, int i2, int i3, zzkk<?> zzkkVar, zzir zzirVar) throws IOException {
        int iZzi = zzi(zzltVar, bArr, i2, i3, zzirVar);
        zzkkVar.add(zzirVar.zzc);
        while (iZzi < i3) {
            int iZza = zza(bArr, iZzi, zzirVar);
            if (i != zzirVar.zza) {
                break;
            }
            iZzi = zzi(zzltVar, bArr, iZza, i3, zzirVar);
            zzkkVar.add(zzirVar.zzc);
        }
        return iZzi;
    }

    static int zzn(int i, byte[] bArr, int i2, int i3, zzmi zzmiVar, zzir zzirVar) throws zzkn {
        if ((i >>> 3) == 0) {
            throw zzkn.zzc();
        }
        switch (i & 7) {
            case 0:
                int iZzc = zzc(bArr, i2, zzirVar);
                zzmiVar.zzh(i, Long.valueOf(zzirVar.zzb));
                return iZzc;
            case 1:
                zzmiVar.zzh(i, Long.valueOf(zze(bArr, i2)));
                return i2 + 8;
            case 2:
                int iZza = zza(bArr, i2, zzirVar);
                int i4 = zzirVar.zza;
                if (i4 < 0) {
                    throw zzkn.zzb();
                }
                if (i4 > bArr.length - iZza) {
                    throw zzkn.zza();
                }
                if (i4 == 0) {
                    zzmiVar.zzh(i, zzjd.zzb);
                } else {
                    zzmiVar.zzh(i, zzjd.zzj(bArr, iZza, i4));
                }
                return iZza + i4;
            case 3:
                int i5 = (i & (-8)) | 4;
                zzmi zzmiVarZzb = zzmi.zzb();
                int i6 = 0;
                while (true) {
                    if (i2 < i3) {
                        int iZza2 = zza(bArr, i2, zzirVar);
                        int i7 = zzirVar.zza;
                        if (i7 == i5) {
                            i6 = i7;
                            i2 = iZza2;
                        } else {
                            i6 = i7;
                            i2 = zzn(i7, bArr, iZza2, i3, zzmiVarZzb, zzirVar);
                        }
                    }
                }
                if (i2 > i3 || i6 != i5) {
                    throw zzkn.zze();
                }
                zzmiVar.zzh(i, zzmiVarZzb);
                return i2;
            case 4:
            default:
                throw zzkn.zzc();
            case 5:
                zzmiVar.zzh(i, Integer.valueOf(zzd(bArr, i2)));
                return i2 + 4;
        }
    }
}
