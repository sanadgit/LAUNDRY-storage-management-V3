package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;
import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzafo {
    private static final zzafo zza = new zzafo(0, new int[0], new Object[0], false);
    private int zzb;
    private int[] zzc;
    private Object[] zzd;
    private int zze;
    private boolean zzf;

    private zzafo() {
        this(0, new int[8], new Object[8], true);
    }

    private zzafo(int i, int[] iArr, Object[] objArr, boolean z) {
        this.zze = -1;
        this.zzb = i;
        this.zzc = iArr;
        this.zzd = objArr;
        this.zzf = z;
    }

    public static zzafo zzc() {
        return zza;
    }

    static zzafo zze(zzafo zzafoVar, zzafo zzafoVar2) {
        int i = zzafoVar.zzb + zzafoVar2.zzb;
        int[] iArrCopyOf = Arrays.copyOf(zzafoVar.zzc, i);
        System.arraycopy(zzafoVar2.zzc, 0, iArrCopyOf, zzafoVar.zzb, zzafoVar2.zzb);
        Object[] objArrCopyOf = Arrays.copyOf(zzafoVar.zzd, i);
        System.arraycopy(zzafoVar2.zzd, 0, objArrCopyOf, zzafoVar.zzb, zzafoVar2.zzb);
        return new zzafo(i, iArrCopyOf, objArrCopyOf, true);
    }

    static zzafo zzf() {
        return new zzafo(0, new int[8], new Object[8], true);
    }

    private final void zzl(int i) {
        int[] iArr = this.zzc;
        if (i > iArr.length) {
            int i2 = this.zzb;
            int i3 = i2 + (i2 / 2);
            if (i3 >= i) {
                i = i3;
            }
            if (i < 8) {
                i = 8;
            }
            this.zzc = Arrays.copyOf(iArr, i);
            this.zzd = Arrays.copyOf(this.zzd, i);
        }
    }

    public final boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || !(obj instanceof zzafo)) {
            return false;
        }
        zzafo zzafoVar = (zzafo) obj;
        int i = this.zzb;
        if (i == zzafoVar.zzb) {
            int[] iArr = this.zzc;
            int[] iArr2 = zzafoVar.zzc;
            int i2 = 0;
            while (true) {
                if (i2 >= i) {
                    Object[] objArr = this.zzd;
                    Object[] objArr2 = zzafoVar.zzd;
                    int i3 = this.zzb;
                    for (int i4 = 0; i4 < i3; i4++) {
                        if (objArr[i4].equals(objArr2[i4])) {
                        }
                    }
                    return true;
                }
                if (iArr[i2] != iArr2[i2]) {
                    break;
                }
                i2++;
            }
        }
        return false;
    }

    public final int hashCode() {
        int i = this.zzb;
        int i2 = (i + 527) * 31;
        int[] iArr = this.zzc;
        int iHashCode = 17;
        int i3 = 17;
        for (int i4 = 0; i4 < i; i4++) {
            i3 = (i3 * 31) + iArr[i4];
        }
        int i5 = (i2 + i3) * 31;
        Object[] objArr = this.zzd;
        int i6 = this.zzb;
        for (int i7 = 0; i7 < i6; i7++) {
            iHashCode = (iHashCode * 31) + objArr[i7].hashCode();
        }
        return i5 + iHashCode;
    }

    public final int zza() {
        int i = this.zze;
        if (i != -1) {
            return i;
        }
        int iZzE = 0;
        for (int i2 = 0; i2 < this.zzb; i2++) {
            int i3 = this.zzc[i2];
            int i4 = i3 >>> 3;
            switch (i3 & 7) {
                case 0:
                    iZzE += zzacn.zzE(i4 << 3) + zzacn.zzF(((Long) this.zzd[i2]).longValue());
                    break;
                case 1:
                    ((Long) this.zzd[i2]).longValue();
                    iZzE += zzacn.zzE(i4 << 3) + 8;
                    break;
                case 2:
                    zzacc zzaccVar = (zzacc) this.zzd[i2];
                    int iZzE2 = zzacn.zzE(i4 << 3);
                    int iZzd = zzaccVar.zzd();
                    iZzE += iZzE2 + zzacn.zzE(iZzd) + iZzd;
                    break;
                case 3:
                    int iZzD = zzacn.zzD(i4);
                    iZzE += iZzD + iZzD + ((zzafo) this.zzd[i2]).zza();
                    break;
                case 4:
                default:
                    throw new IllegalStateException(zzadn.zza());
                case 5:
                    ((Integer) this.zzd[i2]).intValue();
                    iZzE += zzacn.zzE(i4 << 3) + 4;
                    break;
            }
        }
        this.zze = iZzE;
        return iZzE;
    }

    public final int zzb() {
        int i = this.zze;
        if (i != -1) {
            return i;
        }
        int iZzE = 0;
        for (int i2 = 0; i2 < this.zzb; i2++) {
            int i3 = this.zzc[i2];
            zzacc zzaccVar = (zzacc) this.zzd[i2];
            int iZzE2 = zzacn.zzE(8);
            int iZzd = zzaccVar.zzd();
            iZzE += iZzE2 + iZzE2 + zzacn.zzE(16) + zzacn.zzE(i3 >>> 3) + zzacn.zzE(24) + zzacn.zzE(iZzd) + iZzd;
        }
        this.zze = iZzE;
        return iZzE;
    }

    final zzafo zzd(zzafo zzafoVar) {
        if (zzafoVar.equals(zza)) {
            return this;
        }
        zzg();
        int i = this.zzb + zzafoVar.zzb;
        zzl(i);
        System.arraycopy(zzafoVar.zzc, 0, this.zzc, this.zzb, zzafoVar.zzb);
        System.arraycopy(zzafoVar.zzd, 0, this.zzd, this.zzb, zzafoVar.zzb);
        this.zzb = i;
        return this;
    }

    final void zzg() {
        if (!this.zzf) {
            throw new UnsupportedOperationException();
        }
    }

    public final void zzh() {
        this.zzf = false;
    }

    final void zzi(StringBuilder sb, int i) {
        for (int i2 = 0; i2 < this.zzb; i2++) {
            zzaem.zzb(sb, i, String.valueOf(this.zzc[i2] >>> 3), this.zzd[i2]);
        }
    }

    final void zzj(int i, Object obj) {
        zzg();
        zzl(this.zzb + 1);
        int[] iArr = this.zzc;
        int i2 = this.zzb;
        iArr[i2] = i;
        this.zzd[i2] = obj;
        this.zzb = i2 + 1;
    }

    public final void zzk(zzaco zzacoVar) throws IOException {
        if (this.zzb != 0) {
            for (int i = 0; i < this.zzb; i++) {
                int i2 = this.zzc[i];
                Object obj = this.zzd[i];
                int i3 = i2 >>> 3;
                switch (i2 & 7) {
                    case 0:
                        zzacoVar.zzt(i3, ((Long) obj).longValue());
                        break;
                    case 1:
                        zzacoVar.zzm(i3, ((Long) obj).longValue());
                        break;
                    case 2:
                        zzacoVar.zzd(i3, (zzacc) obj);
                        break;
                    case 3:
                        zzacoVar.zzE(i3);
                        ((zzafo) obj).zzk(zzacoVar);
                        zzacoVar.zzh(i3);
                        break;
                    case 4:
                    default:
                        throw new RuntimeException(zzadn.zza());
                    case 5:
                        zzacoVar.zzk(i3, ((Integer) obj).intValue());
                        break;
                }
            }
        }
    }
}
