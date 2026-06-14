package com.google.android.gms.internal.p001firebaseauthapi;

import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.text.HtmlCompat;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;
import kotlinx.coroutines.internal.LockFreeTaskQueueCore;
import sun.misc.Unsafe;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaen<T> implements zzaew<T> {
    private static final int[] zza = new int[0];
    private static final Unsafe zzb = zzafx.zzg();
    private final int[] zzc;
    private final Object[] zzd;
    private final int zze;
    private final int zzf;
    private final zzaek zzg;
    private final boolean zzh;
    private final boolean zzi;
    private final boolean zzj;
    private final int[] zzk;
    private final int zzl;
    private final int zzm;
    private final zzady zzn;
    private final zzafn zzo;
    private final zzact zzp;
    private final zzaep zzq;
    private final zzaef zzr;

    private zzaen(int[] iArr, Object[] objArr, int i, int i2, zzaek zzaekVar, boolean z, boolean z2, int[] iArr2, int i3, int i4, zzaep zzaepVar, zzady zzadyVar, zzafn zzafnVar, zzact zzactVar, zzaef zzaefVar, byte[] bArr) {
        this.zzc = iArr;
        this.zzd = objArr;
        this.zze = i;
        this.zzf = i2;
        this.zzi = zzaekVar instanceof zzadf;
        this.zzj = z;
        boolean z3 = false;
        if (zzactVar != null && zzactVar.zzh(zzaekVar)) {
            z3 = true;
        }
        this.zzh = z3;
        this.zzk = iArr2;
        this.zzl = i3;
        this.zzm = i4;
        this.zzq = zzaepVar;
        this.zzn = zzadyVar;
        this.zzo = zzafnVar;
        this.zzp = zzactVar;
        this.zzg = zzaekVar;
        this.zzr = zzaefVar;
    }

    private final int zzA(int i, int i2) {
        int length = (this.zzc.length / 3) - 1;
        while (i2 <= length) {
            int i3 = (length + i2) >>> 1;
            int i4 = i3 * 3;
            int i5 = this.zzc[i4];
            if (i == i5) {
                return i4;
            }
            if (i < i5) {
                length = i3 - 1;
            } else {
                i2 = i3 + 1;
            }
        }
        return -1;
    }

    private static int zzB(int i) {
        return (i >>> 20) & 255;
    }

    private final int zzC(int i) {
        return this.zzc[i + 1];
    }

    private static long zzD(Object obj, long j) {
        return ((Long) zzafx.zzf(obj, j)).longValue();
    }

    private final zzadj zzE(int i) {
        int i2 = i / 3;
        return (zzadj) this.zzd[i2 + i2 + 1];
    }

    private final zzaew zzF(int i) {
        int i2 = i / 3;
        int i3 = i2 + i2;
        zzaew zzaewVar = (zzaew) this.zzd[i3];
        if (zzaewVar != null) {
            return zzaewVar;
        }
        zzaew zzaewVarZzb = zzaes.zza().zzb((Class) this.zzd[i3 + 1]);
        this.zzd[i3] = zzaewVarZzb;
        return zzaewVarZzb;
    }

    private final Object zzG(Object obj, int i, Object obj2, zzafn zzafnVar, Object obj3) {
        int i2 = this.zzc[i];
        Object objZzf = zzafx.zzf(obj, zzC(i) & 1048575);
        if (objZzf == null || zzE(i) == null) {
            return obj2;
        }
        throw null;
    }

    private final Object zzH(int i) {
        int i2 = i / 3;
        return this.zzd[i2 + i2];
    }

    private final Object zzI(Object obj, int i) {
        zzaew zzaewVarZzF = zzF(i);
        long jZzC = zzC(i) & 1048575;
        if (!zzV(obj, i)) {
            return zzaewVarZzF.zze();
        }
        Object object = zzb.getObject(obj, jZzC);
        if (zzY(object)) {
            return object;
        }
        Object objZze = zzaewVarZzF.zze();
        if (object != null) {
            zzaewVarZzF.zzg(objZze, object);
        }
        return objZze;
    }

    private final Object zzJ(Object obj, int i, int i2) {
        zzaew zzaewVarZzF = zzF(i2);
        if (!zzZ(obj, i, i2)) {
            return zzaewVarZzF.zze();
        }
        Object object = zzb.getObject(obj, zzC(i2) & 1048575);
        if (zzY(object)) {
            return object;
        }
        Object objZze = zzaewVarZzF.zze();
        if (object != null) {
            zzaewVarZzF.zzg(objZze, object);
        }
        return objZze;
    }

    private static Field zzK(Class cls, String str) {
        try {
            return cls.getDeclaredField(str);
        } catch (NoSuchFieldException e) {
            Field[] declaredFields = cls.getDeclaredFields();
            for (Field field : declaredFields) {
                if (str.equals(field.getName())) {
                    return field;
                }
            }
            throw new RuntimeException("Field " + str + " for " + cls.getName() + " not found. Known fields are " + Arrays.toString(declaredFields));
        }
    }

    private static void zzL(Object obj) {
        if (!zzY(obj)) {
            throw new IllegalArgumentException("Mutating immutable message: ".concat(String.valueOf(String.valueOf(obj))));
        }
    }

    private final void zzM(Object obj, Object obj2, int i) {
        if (zzV(obj2, i)) {
            long jZzC = zzC(i) & 1048575;
            Unsafe unsafe = zzb;
            Object object = unsafe.getObject(obj2, jZzC);
            if (object == null) {
                throw new IllegalStateException("Source subfield " + this.zzc[i] + " is present but null: " + obj2.toString());
            }
            zzaew zzaewVarZzF = zzF(i);
            if (!zzV(obj, i)) {
                if (zzY(object)) {
                    Object objZze = zzaewVarZzF.zze();
                    zzaewVarZzF.zzg(objZze, object);
                    unsafe.putObject(obj, jZzC, objZze);
                } else {
                    unsafe.putObject(obj, jZzC, object);
                }
                zzP(obj, i);
                return;
            }
            Object object2 = unsafe.getObject(obj, jZzC);
            if (!zzY(object2)) {
                Object objZze2 = zzaewVarZzF.zze();
                zzaewVarZzF.zzg(objZze2, object2);
                unsafe.putObject(obj, jZzC, objZze2);
                object2 = objZze2;
            }
            zzaewVarZzF.zzg(object2, object);
        }
    }

    private final void zzN(Object obj, Object obj2, int i) {
        int i2 = this.zzc[i];
        if (zzZ(obj2, i2, i)) {
            long jZzC = zzC(i) & 1048575;
            Unsafe unsafe = zzb;
            Object object = unsafe.getObject(obj2, jZzC);
            if (object == null) {
                throw new IllegalStateException("Source subfield " + this.zzc[i] + " is present but null: " + obj2.toString());
            }
            zzaew zzaewVarZzF = zzF(i);
            if (!zzZ(obj, i2, i)) {
                if (zzY(object)) {
                    Object objZze = zzaewVarZzF.zze();
                    zzaewVarZzF.zzg(objZze, object);
                    unsafe.putObject(obj, jZzC, objZze);
                } else {
                    unsafe.putObject(obj, jZzC, object);
                }
                zzQ(obj, i2, i);
                return;
            }
            Object object2 = unsafe.getObject(obj, jZzC);
            if (!zzY(object2)) {
                Object objZze2 = zzaewVarZzF.zze();
                zzaewVarZzF.zzg(objZze2, object2);
                unsafe.putObject(obj, jZzC, objZze2);
                object2 = objZze2;
            }
            zzaewVarZzF.zzg(object2, object);
        }
    }

    private final void zzO(Object obj, int i, zzaev zzaevVar) throws IOException {
        if (zzU(i)) {
            zzafx.zzs(obj, i & 1048575, zzaevVar.zzs());
        } else if (this.zzi) {
            zzafx.zzs(obj, i & 1048575, zzaevVar.zzr());
        } else {
            zzafx.zzs(obj, i & 1048575, zzaevVar.zzp());
        }
    }

    private final void zzP(Object obj, int i) {
        int iZzz = zzz(i);
        long j = 1048575 & iZzz;
        if (j == 1048575) {
            return;
        }
        zzafx.zzq(obj, j, (1 << (iZzz >>> 20)) | zzafx.zzc(obj, j));
    }

    private final void zzQ(Object obj, int i, int i2) {
        zzafx.zzq(obj, zzz(i2) & 1048575, i);
    }

    private final void zzR(Object obj, int i, Object obj2) {
        zzb.putObject(obj, zzC(i) & 1048575, obj2);
        zzP(obj, i);
    }

    private final void zzS(Object obj, int i, int i2, Object obj2) {
        zzb.putObject(obj, zzC(i2) & 1048575, obj2);
        zzQ(obj, i, i2);
    }

    private final boolean zzT(Object obj, Object obj2, int i) {
        return zzV(obj, i) == zzV(obj2, i);
    }

    private static boolean zzU(int i) {
        return (i & 536870912) != 0;
    }

    private final boolean zzV(Object obj, int i) {
        int iZzz = zzz(i);
        long j = iZzz & 1048575;
        if (j != 1048575) {
            return (zzafx.zzc(obj, j) & (1 << (iZzz >>> 20))) != 0;
        }
        int iZzC = zzC(i);
        long j2 = iZzC & 1048575;
        switch (zzB(iZzC)) {
            case 0:
                return Double.doubleToRawLongBits(zzafx.zza(obj, j2)) != 0;
            case 1:
                return Float.floatToRawIntBits(zzafx.zzb(obj, j2)) != 0;
            case 2:
                return zzafx.zzd(obj, j2) != 0;
            case 3:
                return zzafx.zzd(obj, j2) != 0;
            case 4:
                return zzafx.zzc(obj, j2) != 0;
            case 5:
                return zzafx.zzd(obj, j2) != 0;
            case 6:
                return zzafx.zzc(obj, j2) != 0;
            case 7:
                return zzafx.zzw(obj, j2);
            case 8:
                Object objZzf = zzafx.zzf(obj, j2);
                if (objZzf instanceof String) {
                    return !((String) objZzf).isEmpty();
                }
                if (objZzf instanceof zzacc) {
                    return !zzacc.zzb.equals(objZzf);
                }
                throw new IllegalArgumentException();
            case 9:
                return zzafx.zzf(obj, j2) != null;
            case 10:
                return !zzacc.zzb.equals(zzafx.zzf(obj, j2));
            case 11:
                return zzafx.zzc(obj, j2) != 0;
            case 12:
                return zzafx.zzc(obj, j2) != 0;
            case 13:
                return zzafx.zzc(obj, j2) != 0;
            case 14:
                return zzafx.zzd(obj, j2) != 0;
            case 15:
                return zzafx.zzc(obj, j2) != 0;
            case 16:
                return zzafx.zzd(obj, j2) != 0;
            case 17:
                return zzafx.zzf(obj, j2) != null;
            default:
                throw new IllegalArgumentException();
        }
    }

    private final boolean zzW(Object obj, int i, int i2, int i3, int i4) {
        return i2 == 1048575 ? zzV(obj, i) : (i3 & i4) != 0;
    }

    private static boolean zzX(Object obj, int i, zzaew zzaewVar) {
        return zzaewVar.zzk(zzafx.zzf(obj, i & 1048575));
    }

    private static boolean zzY(Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj instanceof zzadf) {
            return ((zzadf) obj).zzK();
        }
        return true;
    }

    private final boolean zzZ(Object obj, int i, int i2) {
        return zzafx.zzc(obj, (long) (zzz(i2) & 1048575)) == i;
    }

    private static boolean zzaa(Object obj, long j) {
        return ((Boolean) zzafx.zzf(obj, j)).booleanValue();
    }

    private final void zzab(Object obj, zzaco zzacoVar) throws IOException {
        int i;
        if (this.zzh) {
            this.zzp.zza(obj);
            throw null;
        }
        int length = this.zzc.length;
        Unsafe unsafe = zzb;
        int i2 = 1048575;
        int i3 = 0;
        int i4 = 0;
        int i5 = 1048575;
        while (i3 < length) {
            int iZzC = zzC(i3);
            int[] iArr = this.zzc;
            int i6 = iArr[i3];
            int iZzB = zzB(iZzC);
            if (iZzB <= 17) {
                int i7 = iArr[i3 + 2];
                int i8 = i7 & i2;
                if (i8 != i5) {
                    i4 = unsafe.getInt(obj, i8);
                    i5 = i8;
                }
                i = 1 << (i7 >>> 20);
            } else {
                i = 0;
            }
            long j = iZzC & i2;
            switch (iZzB) {
                case 0:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzf(i6, zzafx.zza(obj, j));
                    }
                    break;
                case 1:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzo(i6, zzafx.zzb(obj, j));
                    }
                    break;
                case 2:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzt(i6, unsafe.getLong(obj, j));
                    }
                    break;
                case 3:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzJ(i6, unsafe.getLong(obj, j));
                    }
                    break;
                case 4:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzr(i6, unsafe.getInt(obj, j));
                    }
                    break;
                case 5:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzm(i6, unsafe.getLong(obj, j));
                    }
                    break;
                case 6:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzk(i6, unsafe.getInt(obj, j));
                    }
                    break;
                case 7:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzb(i6, zzafx.zzw(obj, j));
                    }
                    break;
                case 8:
                    if ((i4 & i) != 0) {
                        zzad(i6, unsafe.getObject(obj, j), zzacoVar);
                    }
                    break;
                case 9:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzv(i6, unsafe.getObject(obj, j), zzF(i3));
                    }
                    break;
                case 10:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzd(i6, (zzacc) unsafe.getObject(obj, j));
                    }
                    break;
                case 11:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzH(i6, unsafe.getInt(obj, j));
                    }
                    break;
                case 12:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzi(i6, unsafe.getInt(obj, j));
                    }
                    break;
                case 13:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzw(i6, unsafe.getInt(obj, j));
                    }
                    break;
                case 14:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzy(i6, unsafe.getLong(obj, j));
                    }
                    break;
                case 15:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzA(i6, unsafe.getInt(obj, j));
                    }
                    break;
                case 16:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzC(i6, unsafe.getLong(obj, j));
                    }
                    break;
                case 17:
                    if ((i4 & i) != 0) {
                        zzacoVar.zzq(i6, unsafe.getObject(obj, j), zzF(i3));
                    }
                    break;
                case 18:
                    zzaey.zzL(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 19:
                    zzaey.zzP(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 20:
                    zzaey.zzS(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 21:
                    zzaey.zzaa(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 22:
                    zzaey.zzR(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 23:
                    zzaey.zzO(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 24:
                    zzaey.zzN(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 25:
                    zzaey.zzJ(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 26:
                    zzaey.zzY(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar);
                    break;
                case 27:
                    zzaey.zzT(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, zzF(i3));
                    break;
                case 28:
                    zzaey.zzK(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                    zzaey.zzZ(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 30:
                    zzaey.zzM(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                    zzaey.zzU(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 32:
                    zzaey.zzV(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 33:
                    zzaey.zzW(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 34:
                    zzaey.zzX(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, false);
                    break;
                case 35:
                    zzaey.zzL(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 36:
                    zzaey.zzP(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 37:
                    zzaey.zzS(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 38:
                    zzaey.zzaa(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 39:
                    zzaey.zzR(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 40:
                    zzaey.zzO(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 41:
                    zzaey.zzN(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 42:
                    zzaey.zzJ(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 43:
                    zzaey.zzZ(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 44:
                    zzaey.zzM(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 45:
                    zzaey.zzU(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 46:
                    zzaey.zzV(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case 47:
                    zzaey.zzW(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                    zzaey.zzX(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, true);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                    zzaey.zzQ(this.zzc[i3], (List) unsafe.getObject(obj, j), zzacoVar, zzF(i3));
                    break;
                case 50:
                    zzac(zzacoVar, i6, unsafe.getObject(obj, j), i3);
                    break;
                case 51:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzf(i6, zzo(obj, j));
                    }
                    break;
                case 52:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzo(i6, zzp(obj, j));
                    }
                    break;
                case 53:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzt(i6, zzD(obj, j));
                    }
                    break;
                case 54:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzJ(i6, zzD(obj, j));
                    }
                    break;
                case 55:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzr(i6, zzs(obj, j));
                    }
                    break;
                case 56:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzm(i6, zzD(obj, j));
                    }
                    break;
                case 57:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzk(i6, zzs(obj, j));
                    }
                    break;
                case 58:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzb(i6, zzaa(obj, j));
                    }
                    break;
                case 59:
                    if (zzZ(obj, i6, i3)) {
                        zzad(i6, unsafe.getObject(obj, j), zzacoVar);
                    }
                    break;
                case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzv(i6, unsafe.getObject(obj, j), zzF(i3));
                    }
                    break;
                case LockFreeTaskQueueCore.CLOSED_SHIFT /* 61 */:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzd(i6, (zzacc) unsafe.getObject(obj, j));
                    }
                    break;
                case 62:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzH(i6, zzs(obj, j));
                    }
                    break;
                case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzi(i6, zzs(obj, j));
                    }
                    break;
                case 64:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzw(i6, zzs(obj, j));
                    }
                    break;
                case 65:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzy(i6, zzD(obj, j));
                    }
                    break;
                case 66:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzA(i6, zzs(obj, j));
                    }
                    break;
                case 67:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzC(i6, zzD(obj, j));
                    }
                    break;
                case 68:
                    if (zzZ(obj, i6, i3)) {
                        zzacoVar.zzq(i6, unsafe.getObject(obj, j), zzF(i3));
                    }
                    break;
            }
            i3 += 3;
            i2 = 1048575;
        }
        zzafn zzafnVar = this.zzo;
        zzafnVar.zzr(zzafnVar.zzd(obj), zzacoVar);
    }

    private final void zzac(zzaco zzacoVar, int i, Object obj, int i2) throws IOException {
        if (obj == null) {
            return;
        }
        throw null;
    }

    private static final void zzad(int i, Object obj, zzaco zzacoVar) throws IOException {
        if (obj instanceof String) {
            zzacoVar.zzF(i, (String) obj);
        } else {
            zzacoVar.zzd(i, (zzacc) obj);
        }
    }

    static zzafo zzd(Object obj) {
        zzadf zzadfVar = (zzadf) obj;
        zzafo zzafoVar = zzadfVar.zzc;
        if (zzafoVar != zzafo.zzc()) {
            return zzafoVar;
        }
        zzafo zzafoVarZzf = zzafo.zzf();
        zzadfVar.zzc = zzafoVarZzf;
        return zzafoVarZzf;
    }

    static zzaen zzl(Class cls, zzaeh zzaehVar, zzaep zzaepVar, zzady zzadyVar, zzafn zzafnVar, zzact zzactVar, zzaef zzaefVar) {
        if (zzaehVar instanceof zzaeu) {
            return zzm((zzaeu) zzaehVar, zzaepVar, zzadyVar, zzafnVar, zzactVar, zzaefVar);
        }
        throw null;
    }

    /* JADX WARN: Removed duplicated region for block: B:187:0x0393  */
    /* JADX WARN: Removed duplicated region for block: B:193:0x03ad  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    static com.google.android.gms.internal.p001firebaseauthapi.zzaen zzm(com.google.android.gms.internal.p001firebaseauthapi.zzaeu r34, com.google.android.gms.internal.p001firebaseauthapi.zzaep r35, com.google.android.gms.internal.p001firebaseauthapi.zzady r36, com.google.android.gms.internal.p001firebaseauthapi.zzafn r37, com.google.android.gms.internal.p001firebaseauthapi.zzact r38, com.google.android.gms.internal.p001firebaseauthapi.zzaef r39) {
        /*
            Method dump skipped, instruction units count: 1047
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzaen.zzm(com.google.android.gms.internal.firebase-auth-api.zzaeu, com.google.android.gms.internal.firebase-auth-api.zzaep, com.google.android.gms.internal.firebase-auth-api.zzady, com.google.android.gms.internal.firebase-auth-api.zzafn, com.google.android.gms.internal.firebase-auth-api.zzact, com.google.android.gms.internal.firebase-auth-api.zzaef):com.google.android.gms.internal.firebase-auth-api.zzaen");
    }

    private static double zzo(Object obj, long j) {
        return ((Double) zzafx.zzf(obj, j)).doubleValue();
    }

    private static float zzp(Object obj, long j) {
        return ((Float) zzafx.zzf(obj, j)).floatValue();
    }

    private final int zzq(Object obj) {
        int i;
        Unsafe unsafe = zzb;
        int i2 = 1048575;
        int i3 = 0;
        int iZzE = 0;
        int i4 = 0;
        int i5 = 1048575;
        while (i3 < this.zzc.length) {
            int iZzC = zzC(i3);
            int[] iArr = this.zzc;
            int i6 = iArr[i3];
            int iZzB = zzB(iZzC);
            if (iZzB <= 17) {
                int i7 = iArr[i3 + 2];
                int i8 = i7 & i2;
                i = 1 << (i7 >>> 20);
                if (i8 != i5) {
                    i4 = unsafe.getInt(obj, i8);
                    i5 = i8;
                }
            } else {
                i = 0;
            }
            long j = iZzC & i2;
            switch (iZzB) {
                case 0:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + 8;
                    }
                    break;
                case 1:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + 4;
                    }
                    break;
                case 2:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzF(unsafe.getLong(obj, j));
                    }
                    break;
                case 3:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzF(unsafe.getLong(obj, j));
                    }
                    break;
                case 4:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzy(unsafe.getInt(obj, j));
                    }
                    break;
                case 5:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + 8;
                    }
                    break;
                case 6:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + 4;
                    }
                    break;
                case 7:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + 1;
                    }
                    break;
                case 8:
                    if ((i4 & i) != 0) {
                        Object object = unsafe.getObject(obj, j);
                        if (!(object instanceof zzacc)) {
                            iZzE += zzacn.zzE(i6 << 3) + zzacn.zzC((String) object);
                        } else {
                            int iZzE2 = zzacn.zzE(i6 << 3);
                            int iZzd = ((zzacc) object).zzd();
                            iZzE += iZzE2 + zzacn.zzE(iZzd) + iZzd;
                        }
                    }
                    break;
                case 9:
                    if ((i4 & i) != 0) {
                        iZzE += zzaey.zzo(i6, unsafe.getObject(obj, j), zzF(i3));
                    }
                    break;
                case 10:
                    if ((i4 & i) != 0) {
                        zzacc zzaccVar = (zzacc) unsafe.getObject(obj, j);
                        int iZzE3 = zzacn.zzE(i6 << 3);
                        int iZzd2 = zzaccVar.zzd();
                        iZzE += iZzE3 + zzacn.zzE(iZzd2) + iZzd2;
                    }
                    break;
                case 11:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzE(unsafe.getInt(obj, j));
                    }
                    break;
                case 12:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzy(unsafe.getInt(obj, j));
                    }
                    break;
                case 13:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + 4;
                    }
                    break;
                case 14:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzE(i6 << 3) + 8;
                    }
                    break;
                case 15:
                    if ((i4 & i) != 0) {
                        int i9 = unsafe.getInt(obj, j);
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzE((i9 >> 31) ^ (i9 + i9));
                    }
                    break;
                case 16:
                    if ((i & i4) != 0) {
                        long j2 = unsafe.getLong(obj, j);
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzF((j2 >> 63) ^ (j2 + j2));
                    }
                    break;
                case 17:
                    if ((i4 & i) != 0) {
                        iZzE += zzacn.zzx(i6, (zzaek) unsafe.getObject(obj, j), zzF(i3));
                    }
                    break;
                case 18:
                    iZzE += zzaey.zzh(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 19:
                    iZzE += zzaey.zzf(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 20:
                    iZzE += zzaey.zzm(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 21:
                    iZzE += zzaey.zzx(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 22:
                    iZzE += zzaey.zzk(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 23:
                    iZzE += zzaey.zzh(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 24:
                    iZzE += zzaey.zzf(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 25:
                    iZzE += zzaey.zza(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 26:
                    iZzE += zzaey.zzu(i6, (List) unsafe.getObject(obj, j));
                    break;
                case 27:
                    iZzE += zzaey.zzp(i6, (List) unsafe.getObject(obj, j), zzF(i3));
                    break;
                case 28:
                    iZzE += zzaey.zzc(i6, (List) unsafe.getObject(obj, j));
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                    iZzE += zzaey.zzv(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 30:
                    iZzE += zzaey.zzd(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                    iZzE += zzaey.zzf(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 32:
                    iZzE += zzaey.zzh(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 33:
                    iZzE += zzaey.zzq(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 34:
                    iZzE += zzaey.zzs(i6, (List) unsafe.getObject(obj, j), false);
                    break;
                case 35:
                    int iZzi = zzaey.zzi((List) unsafe.getObject(obj, j));
                    if (iZzi > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzi) + iZzi;
                    }
                    break;
                case 36:
                    int iZzg = zzaey.zzg((List) unsafe.getObject(obj, j));
                    if (iZzg > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzg) + iZzg;
                    }
                    break;
                case 37:
                    int iZzn = zzaey.zzn((List) unsafe.getObject(obj, j));
                    if (iZzn > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzn) + iZzn;
                    }
                    break;
                case 38:
                    int iZzy = zzaey.zzy((List) unsafe.getObject(obj, j));
                    if (iZzy > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzy) + iZzy;
                    }
                    break;
                case 39:
                    int iZzl = zzaey.zzl((List) unsafe.getObject(obj, j));
                    if (iZzl > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzl) + iZzl;
                    }
                    break;
                case 40:
                    int iZzi2 = zzaey.zzi((List) unsafe.getObject(obj, j));
                    if (iZzi2 > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzi2) + iZzi2;
                    }
                    break;
                case 41:
                    int iZzg2 = zzaey.zzg((List) unsafe.getObject(obj, j));
                    if (iZzg2 > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzg2) + iZzg2;
                    }
                    break;
                case 42:
                    int iZzb = zzaey.zzb((List) unsafe.getObject(obj, j));
                    if (iZzb > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzb) + iZzb;
                    }
                    break;
                case 43:
                    int iZzw = zzaey.zzw((List) unsafe.getObject(obj, j));
                    if (iZzw > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzw) + iZzw;
                    }
                    break;
                case 44:
                    int iZze = zzaey.zze((List) unsafe.getObject(obj, j));
                    if (iZze > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZze) + iZze;
                    }
                    break;
                case 45:
                    int iZzg3 = zzaey.zzg((List) unsafe.getObject(obj, j));
                    if (iZzg3 > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzg3) + iZzg3;
                    }
                    break;
                case 46:
                    int iZzi3 = zzaey.zzi((List) unsafe.getObject(obj, j));
                    if (iZzi3 > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzi3) + iZzi3;
                    }
                    break;
                case 47:
                    int iZzr = zzaey.zzr((List) unsafe.getObject(obj, j));
                    if (iZzr > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzr) + iZzr;
                    }
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                    int iZzt = zzaey.zzt((List) unsafe.getObject(obj, j));
                    if (iZzt > 0) {
                        iZzE += zzacn.zzD(i6) + zzacn.zzE(iZzt) + iZzt;
                    }
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                    iZzE += zzaey.zzj(i6, (List) unsafe.getObject(obj, j), zzF(i3));
                    break;
                case 50:
                    zzaef.zza(i6, unsafe.getObject(obj, j), zzH(i3));
                    break;
                case 51:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + 8;
                    }
                    break;
                case 52:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + 4;
                    }
                    break;
                case 53:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzF(zzD(obj, j));
                    }
                    break;
                case 54:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzF(zzD(obj, j));
                    }
                    break;
                case 55:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzy(zzs(obj, j));
                    }
                    break;
                case 56:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + 8;
                    }
                    break;
                case 57:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + 4;
                    }
                    break;
                case 58:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + 1;
                    }
                    break;
                case 59:
                    if (zzZ(obj, i6, i3)) {
                        Object object2 = unsafe.getObject(obj, j);
                        if (!(object2 instanceof zzacc)) {
                            iZzE += zzacn.zzE(i6 << 3) + zzacn.zzC((String) object2);
                        } else {
                            int iZzE4 = zzacn.zzE(i6 << 3);
                            int iZzd3 = ((zzacc) object2).zzd();
                            iZzE += iZzE4 + zzacn.zzE(iZzd3) + iZzd3;
                        }
                    }
                    break;
                case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzaey.zzo(i6, unsafe.getObject(obj, j), zzF(i3));
                    }
                    break;
                case LockFreeTaskQueueCore.CLOSED_SHIFT /* 61 */:
                    if (zzZ(obj, i6, i3)) {
                        zzacc zzaccVar2 = (zzacc) unsafe.getObject(obj, j);
                        int iZzE5 = zzacn.zzE(i6 << 3);
                        int iZzd4 = zzaccVar2.zzd();
                        iZzE += iZzE5 + zzacn.zzE(iZzd4) + iZzd4;
                    }
                    break;
                case 62:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzE(zzs(obj, j));
                    }
                    break;
                case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzy(zzs(obj, j));
                    }
                    break;
                case 64:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + 4;
                    }
                    break;
                case 65:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzE(i6 << 3) + 8;
                    }
                    break;
                case 66:
                    if (zzZ(obj, i6, i3)) {
                        int iZzs = zzs(obj, j);
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzE((iZzs >> 31) ^ (iZzs + iZzs));
                    }
                    break;
                case 67:
                    if (zzZ(obj, i6, i3)) {
                        long jZzD = zzD(obj, j);
                        iZzE += zzacn.zzE(i6 << 3) + zzacn.zzF((jZzD >> 63) ^ (jZzD + jZzD));
                    }
                    break;
                case 68:
                    if (zzZ(obj, i6, i3)) {
                        iZzE += zzacn.zzx(i6, (zzaek) unsafe.getObject(obj, j), zzF(i3));
                    }
                    break;
            }
            i3 += 3;
            i2 = 1048575;
        }
        zzafn zzafnVar = this.zzo;
        int iZza = iZzE + zzafnVar.zza(zzafnVar.zzd(obj));
        if (!this.zzh) {
            return iZza;
        }
        this.zzp.zza(obj);
        throw null;
    }

    private final int zzr(Object obj) {
        Unsafe unsafe = zzb;
        int iZzE = 0;
        for (int i = 0; i < this.zzc.length; i += 3) {
            int iZzC = zzC(i);
            int iZzB = zzB(iZzC);
            int i2 = this.zzc[i];
            long j = iZzC & 1048575;
            if (iZzB >= zzacy.DOUBLE_LIST_PACKED.zza() && iZzB <= zzacy.SINT64_LIST_PACKED.zza()) {
                int i3 = this.zzc[i + 2];
            }
            switch (iZzB) {
                case 0:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 8;
                    }
                    break;
                case 1:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 4;
                    }
                    break;
                case 2:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzF(zzafx.zzd(obj, j));
                    }
                    break;
                case 3:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzF(zzafx.zzd(obj, j));
                    }
                    break;
                case 4:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzy(zzafx.zzc(obj, j));
                    }
                    break;
                case 5:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 8;
                    }
                    break;
                case 6:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 4;
                    }
                    break;
                case 7:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 1;
                    }
                    break;
                case 8:
                    if (zzV(obj, i)) {
                        Object objZzf = zzafx.zzf(obj, j);
                        if (objZzf instanceof zzacc) {
                            int iZzE2 = zzacn.zzE(i2 << 3);
                            int iZzd = ((zzacc) objZzf).zzd();
                            iZzE += iZzE2 + zzacn.zzE(iZzd) + iZzd;
                        } else {
                            iZzE += zzacn.zzE(i2 << 3) + zzacn.zzC((String) objZzf);
                        }
                    }
                    break;
                case 9:
                    if (zzV(obj, i)) {
                        iZzE += zzaey.zzo(i2, zzafx.zzf(obj, j), zzF(i));
                    }
                    break;
                case 10:
                    if (zzV(obj, i)) {
                        zzacc zzaccVar = (zzacc) zzafx.zzf(obj, j);
                        int iZzE3 = zzacn.zzE(i2 << 3);
                        int iZzd2 = zzaccVar.zzd();
                        iZzE += iZzE3 + zzacn.zzE(iZzd2) + iZzd2;
                    }
                    break;
                case 11:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzE(zzafx.zzc(obj, j));
                    }
                    break;
                case 12:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzy(zzafx.zzc(obj, j));
                    }
                    break;
                case 13:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 4;
                    }
                    break;
                case 14:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 8;
                    }
                    break;
                case 15:
                    if (zzV(obj, i)) {
                        int iZzc = zzafx.zzc(obj, j);
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzE((iZzc >> 31) ^ (iZzc + iZzc));
                    }
                    break;
                case 16:
                    if (zzV(obj, i)) {
                        long jZzd = zzafx.zzd(obj, j);
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzF((jZzd >> 63) ^ (jZzd + jZzd));
                    }
                    break;
                case 17:
                    if (zzV(obj, i)) {
                        iZzE += zzacn.zzx(i2, (zzaek) zzafx.zzf(obj, j), zzF(i));
                    }
                    break;
                case 18:
                    iZzE += zzaey.zzh(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 19:
                    iZzE += zzaey.zzf(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 20:
                    iZzE += zzaey.zzm(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 21:
                    iZzE += zzaey.zzx(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 22:
                    iZzE += zzaey.zzk(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 23:
                    iZzE += zzaey.zzh(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 24:
                    iZzE += zzaey.zzf(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 25:
                    iZzE += zzaey.zza(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 26:
                    iZzE += zzaey.zzu(i2, (List) zzafx.zzf(obj, j));
                    break;
                case 27:
                    iZzE += zzaey.zzp(i2, (List) zzafx.zzf(obj, j), zzF(i));
                    break;
                case 28:
                    iZzE += zzaey.zzc(i2, (List) zzafx.zzf(obj, j));
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                    iZzE += zzaey.zzv(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 30:
                    iZzE += zzaey.zzd(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                    iZzE += zzaey.zzf(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 32:
                    iZzE += zzaey.zzh(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 33:
                    iZzE += zzaey.zzq(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 34:
                    iZzE += zzaey.zzs(i2, (List) zzafx.zzf(obj, j), false);
                    break;
                case 35:
                    int iZzi = zzaey.zzi((List) unsafe.getObject(obj, j));
                    if (iZzi > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzi) + iZzi;
                    }
                    break;
                case 36:
                    int iZzg = zzaey.zzg((List) unsafe.getObject(obj, j));
                    if (iZzg > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzg) + iZzg;
                    }
                    break;
                case 37:
                    int iZzn = zzaey.zzn((List) unsafe.getObject(obj, j));
                    if (iZzn > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzn) + iZzn;
                    }
                    break;
                case 38:
                    int iZzy = zzaey.zzy((List) unsafe.getObject(obj, j));
                    if (iZzy > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzy) + iZzy;
                    }
                    break;
                case 39:
                    int iZzl = zzaey.zzl((List) unsafe.getObject(obj, j));
                    if (iZzl > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzl) + iZzl;
                    }
                    break;
                case 40:
                    int iZzi2 = zzaey.zzi((List) unsafe.getObject(obj, j));
                    if (iZzi2 > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzi2) + iZzi2;
                    }
                    break;
                case 41:
                    int iZzg2 = zzaey.zzg((List) unsafe.getObject(obj, j));
                    if (iZzg2 > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzg2) + iZzg2;
                    }
                    break;
                case 42:
                    int iZzb = zzaey.zzb((List) unsafe.getObject(obj, j));
                    if (iZzb > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzb) + iZzb;
                    }
                    break;
                case 43:
                    int iZzw = zzaey.zzw((List) unsafe.getObject(obj, j));
                    if (iZzw > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzw) + iZzw;
                    }
                    break;
                case 44:
                    int iZze = zzaey.zze((List) unsafe.getObject(obj, j));
                    if (iZze > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZze) + iZze;
                    }
                    break;
                case 45:
                    int iZzg3 = zzaey.zzg((List) unsafe.getObject(obj, j));
                    if (iZzg3 > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzg3) + iZzg3;
                    }
                    break;
                case 46:
                    int iZzi3 = zzaey.zzi((List) unsafe.getObject(obj, j));
                    if (iZzi3 > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzi3) + iZzi3;
                    }
                    break;
                case 47:
                    int iZzr = zzaey.zzr((List) unsafe.getObject(obj, j));
                    if (iZzr > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzr) + iZzr;
                    }
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                    int iZzt = zzaey.zzt((List) unsafe.getObject(obj, j));
                    if (iZzt > 0) {
                        iZzE += zzacn.zzD(i2) + zzacn.zzE(iZzt) + iZzt;
                    }
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                    iZzE += zzaey.zzj(i2, (List) zzafx.zzf(obj, j), zzF(i));
                    break;
                case 50:
                    zzaef.zza(i2, zzafx.zzf(obj, j), zzH(i));
                    break;
                case 51:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 8;
                    }
                    break;
                case 52:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 4;
                    }
                    break;
                case 53:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzF(zzD(obj, j));
                    }
                    break;
                case 54:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzF(zzD(obj, j));
                    }
                    break;
                case 55:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzy(zzs(obj, j));
                    }
                    break;
                case 56:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 8;
                    }
                    break;
                case 57:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 4;
                    }
                    break;
                case 58:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 1;
                    }
                    break;
                case 59:
                    if (zzZ(obj, i2, i)) {
                        Object objZzf2 = zzafx.zzf(obj, j);
                        if (objZzf2 instanceof zzacc) {
                            int iZzE4 = zzacn.zzE(i2 << 3);
                            int iZzd3 = ((zzacc) objZzf2).zzd();
                            iZzE += iZzE4 + zzacn.zzE(iZzd3) + iZzd3;
                        } else {
                            iZzE += zzacn.zzE(i2 << 3) + zzacn.zzC((String) objZzf2);
                        }
                    }
                    break;
                case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzaey.zzo(i2, zzafx.zzf(obj, j), zzF(i));
                    }
                    break;
                case LockFreeTaskQueueCore.CLOSED_SHIFT /* 61 */:
                    if (zzZ(obj, i2, i)) {
                        zzacc zzaccVar2 = (zzacc) zzafx.zzf(obj, j);
                        int iZzE5 = zzacn.zzE(i2 << 3);
                        int iZzd4 = zzaccVar2.zzd();
                        iZzE += iZzE5 + zzacn.zzE(iZzd4) + iZzd4;
                    }
                    break;
                case 62:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzE(zzs(obj, j));
                    }
                    break;
                case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzy(zzs(obj, j));
                    }
                    break;
                case 64:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 4;
                    }
                    break;
                case 65:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzE(i2 << 3) + 8;
                    }
                    break;
                case 66:
                    if (zzZ(obj, i2, i)) {
                        int iZzs = zzs(obj, j);
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzE((iZzs >> 31) ^ (iZzs + iZzs));
                    }
                    break;
                case 67:
                    if (zzZ(obj, i2, i)) {
                        long jZzD = zzD(obj, j);
                        iZzE += zzacn.zzE(i2 << 3) + zzacn.zzF((jZzD >> 63) ^ (jZzD + jZzD));
                    }
                    break;
                case 68:
                    if (zzZ(obj, i2, i)) {
                        iZzE += zzacn.zzx(i2, (zzaek) zzafx.zzf(obj, j), zzF(i));
                    }
                    break;
            }
        }
        zzafn zzafnVar = this.zzo;
        return iZzE + zzafnVar.zza(zzafnVar.zzd(obj));
    }

    private static int zzs(Object obj, long j) {
        return ((Integer) zzafx.zzf(obj, j)).intValue();
    }

    private final int zzt(Object obj, byte[] bArr, int i, int i2, int i3, long j, zzabp zzabpVar) throws IOException {
        Unsafe unsafe = zzb;
        Object objZzH = zzH(i3);
        Object object = unsafe.getObject(obj, j);
        if (zzaef.zzb(object)) {
            zzaee zzaeeVarZzb = zzaee.zza().zzb();
            zzaef.zzc(zzaeeVarZzb, object);
            unsafe.putObject(obj, j, zzaeeVarZzb);
        }
        throw null;
    }

    private final int zzu(Object obj, byte[] bArr, int i, int i2, int i3, int i4, int i5, int i6, int i7, long j, int i8, zzabp zzabpVar) throws IOException {
        Unsafe unsafe = zzb;
        long j2 = this.zzc[i8 + 2] & 1048575;
        switch (i7) {
            case 51:
                if (i5 != 1) {
                    return i;
                }
                unsafe.putObject(obj, j, Double.valueOf(Double.longBitsToDouble(zzabq.zzp(bArr, i))));
                unsafe.putInt(obj, j2, i4);
                return i + 8;
            case 52:
                if (i5 != 5) {
                    return i;
                }
                unsafe.putObject(obj, j, Float.valueOf(Float.intBitsToFloat(zzabq.zzb(bArr, i))));
                unsafe.putInt(obj, j2, i4);
                return i + 4;
            case 53:
            case 54:
                if (i5 != 0) {
                    return i;
                }
                int iZzm = zzabq.zzm(bArr, i, zzabpVar);
                unsafe.putObject(obj, j, Long.valueOf(zzabpVar.zzb));
                unsafe.putInt(obj, j2, i4);
                return iZzm;
            case 55:
            case 62:
                if (i5 != 0) {
                    return i;
                }
                int iZzj = zzabq.zzj(bArr, i, zzabpVar);
                unsafe.putObject(obj, j, Integer.valueOf(zzabpVar.zza));
                unsafe.putInt(obj, j2, i4);
                return iZzj;
            case 56:
            case 65:
                if (i5 != 1) {
                    return i;
                }
                unsafe.putObject(obj, j, Long.valueOf(zzabq.zzp(bArr, i)));
                unsafe.putInt(obj, j2, i4);
                return i + 8;
            case 57:
            case 64:
                if (i5 != 5) {
                    return i;
                }
                unsafe.putObject(obj, j, Integer.valueOf(zzabq.zzb(bArr, i)));
                unsafe.putInt(obj, j2, i4);
                return i + 4;
            case 58:
                if (i5 != 0) {
                    return i;
                }
                int iZzm2 = zzabq.zzm(bArr, i, zzabpVar);
                unsafe.putObject(obj, j, Boolean.valueOf(zzabpVar.zzb != 0));
                unsafe.putInt(obj, j2, i4);
                return iZzm2;
            case 59:
                if (i5 != 2) {
                    return i;
                }
                int iZzj2 = zzabq.zzj(bArr, i, zzabpVar);
                int i9 = zzabpVar.zza;
                if (i9 == 0) {
                    unsafe.putObject(obj, j, "");
                } else {
                    if ((i6 & 536870912) != 0 && !zzagc.zzf(bArr, iZzj2, iZzj2 + i9)) {
                        throw zzadn.zzd();
                    }
                    unsafe.putObject(obj, j, new String(bArr, iZzj2, i9, zzadl.zzb));
                    iZzj2 += i9;
                }
                unsafe.putInt(obj, j2, i4);
                return iZzj2;
            case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                if (i5 != 2) {
                    return i;
                }
                Object objZzJ = zzJ(obj, i4, i8);
                int iZzo = zzabq.zzo(objZzJ, zzF(i8), bArr, i, i2, zzabpVar);
                zzS(obj, i4, i8, objZzJ);
                return iZzo;
            case LockFreeTaskQueueCore.CLOSED_SHIFT /* 61 */:
                if (i5 != 2) {
                    return i;
                }
                int iZza = zzabq.zza(bArr, i, zzabpVar);
                unsafe.putObject(obj, j, zzabpVar.zzc);
                unsafe.putInt(obj, j2, i4);
                return iZza;
            case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                if (i5 != 0) {
                    return i;
                }
                int iZzj3 = zzabq.zzj(bArr, i, zzabpVar);
                int i10 = zzabpVar.zza;
                zzadj zzadjVarZzE = zzE(i8);
                if (zzadjVarZzE == null || zzadjVarZzE.zza()) {
                    unsafe.putObject(obj, j, Integer.valueOf(i10));
                    unsafe.putInt(obj, j2, i4);
                } else {
                    zzd(obj).zzj(i3, Long.valueOf(i10));
                }
                return iZzj3;
            case 66:
                if (i5 != 0) {
                    return i;
                }
                int iZzj4 = zzabq.zzj(bArr, i, zzabpVar);
                unsafe.putObject(obj, j, Integer.valueOf(zzacg.zzs(zzabpVar.zza)));
                unsafe.putInt(obj, j2, i4);
                return iZzj4;
            case 67:
                if (i5 != 0) {
                    return i;
                }
                int iZzm3 = zzabq.zzm(bArr, i, zzabpVar);
                unsafe.putObject(obj, j, Long.valueOf(zzacg.zzt(zzabpVar.zzb)));
                unsafe.putInt(obj, j2, i4);
                return iZzm3;
            case 68:
                if (i5 != 3) {
                    return i;
                }
                Object objZzJ2 = zzJ(obj, i4, i8);
                int iZzn = zzabq.zzn(objZzJ2, zzF(i8), bArr, i, i2, (i3 & (-8)) | 4, zzabpVar);
                zzS(obj, i4, i8, objZzJ2);
                return iZzn;
            default:
                return i;
        }
    }

    private final int zzv(Object obj, byte[] bArr, int i, int i2, zzabp zzabpVar) throws IOException {
        int i3;
        int iZzk;
        int i4;
        int i5;
        Unsafe unsafe;
        int i6;
        int i7;
        int i8;
        int i9;
        int i10;
        int i11;
        int i12;
        zzaen<T> zzaenVar = this;
        Object obj2 = obj;
        byte[] bArr2 = bArr;
        int i13 = i2;
        zzabp zzabpVar2 = zzabpVar;
        zzL(obj);
        Unsafe unsafe2 = zzb;
        int i14 = 1048575;
        int i15 = -1;
        int iZzi = i;
        int i16 = -1;
        int i17 = 0;
        int i18 = 0;
        int i19 = 1048575;
        while (iZzi < i13) {
            int i20 = iZzi + 1;
            byte b = bArr2[iZzi];
            if (b < 0) {
                iZzk = zzabq.zzk(b, bArr2, i20, zzabpVar2);
                i3 = zzabpVar2.zza;
            } else {
                i3 = b;
                iZzk = i20;
            }
            int i21 = i3 >>> 3;
            int i22 = i3 & 7;
            int iZzy = i21 > i16 ? zzaenVar.zzy(i21, i17 / 3) : zzaenVar.zzx(i21);
            if (iZzy == i15) {
                i4 = iZzk;
                i5 = i21;
                unsafe = unsafe2;
                i6 = 0;
            } else {
                int[] iArr = zzaenVar.zzc;
                int i23 = iArr[iZzy + 1];
                int iZzB = zzB(i23);
                long j = i23 & i14;
                if (iZzB <= 17) {
                    int i24 = iArr[iZzy + 2];
                    int i25 = 1 << (i24 >>> 20);
                    int i26 = i24 & 1048575;
                    if (i26 != i19) {
                        if (i19 != 1048575) {
                            unsafe2.putInt(obj2, i19, i18);
                        }
                        if (i26 != 1048575) {
                            i18 = unsafe2.getInt(obj2, i26);
                        }
                        i19 = i26;
                    }
                    switch (iZzB) {
                        case 0:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            i8 = iZzk;
                            i9 = i18;
                            if (i22 != 1) {
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                zzafx.zzo(obj2, j, Double.longBitsToDouble(zzabq.zzp(bArr2, i8)));
                                iZzi = i8 + 8;
                                i18 = i9 | i25;
                                i13 = i2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 1:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            i8 = iZzk;
                            i9 = i18;
                            if (i22 != 5) {
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                zzafx.zzp(obj2, j, Float.intBitsToFloat(zzabq.zzb(bArr2, i8)));
                                iZzi = i8 + 4;
                                i18 = i9 | i25;
                                i13 = i2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 2:
                        case 3:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            i8 = iZzk;
                            i9 = i18;
                            if (i22 != 0) {
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                int iZzm = zzabq.zzm(bArr2, i8, zzabpVar2);
                                unsafe2.putLong(obj, j, zzabpVar2.zzb);
                                i18 = i9 | i25;
                                i17 = i7;
                                iZzi = iZzm;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                                i13 = i2;
                            }
                            break;
                        case 4:
                        case 11:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            i8 = iZzk;
                            i9 = i18;
                            if (i22 != 0) {
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                iZzi = zzabq.zzj(bArr2, i8, zzabpVar2);
                                unsafe2.putInt(obj2, j, zzabpVar2.zza);
                                i18 = i9 | i25;
                                i13 = i2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 5:
                        case 14:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            i9 = i18;
                            if (i22 != 1) {
                                i8 = iZzk;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                unsafe2.putLong(obj, j, zzabq.zzp(bArr2, iZzk));
                                iZzi = iZzk + 8;
                                i18 = i9 | i25;
                                i13 = i2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 6:
                        case 13:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            i9 = i18;
                            if (i22 != 5) {
                                i8 = iZzk;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                unsafe2.putInt(obj2, j, zzabq.zzb(bArr2, iZzk));
                                iZzi = iZzk + 4;
                                i18 = i9 | i25;
                                i13 = i2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 7:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            i9 = i18;
                            if (i22 != 0) {
                                i8 = iZzk;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                int iZzm2 = zzabq.zzm(bArr2, iZzk, zzabpVar2);
                                zzafx.zzm(obj2, j, zzabpVar2.zzb != 0);
                                i18 = i9 | i25;
                                i13 = i2;
                                iZzi = iZzm2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 8:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            i9 = i18;
                            if (i22 != 2) {
                                i8 = iZzk;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                iZzi = (536870912 & i23) == 0 ? zzabq.zzg(bArr2, iZzk, zzabpVar2) : zzabq.zzh(bArr2, iZzk, zzabpVar2);
                                unsafe2.putObject(obj2, j, zzabpVar2.zzc);
                                i18 = i9 | i25;
                                i13 = i2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 9:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            if (i22 != 2) {
                                i8 = iZzk;
                                i9 = i18;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                Object objZzI = zzaenVar.zzI(obj2, i7);
                                iZzi = zzabq.zzo(objZzI, zzaenVar.zzF(i7), bArr, iZzk, i2, zzabpVar);
                                zzaenVar.zzR(obj2, i7, objZzI);
                                i18 |= i25;
                                i13 = i2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 10:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            if (i22 != 2) {
                                i8 = iZzk;
                                i9 = i18;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                int iZza = zzabq.zza(bArr2, iZzk, zzabpVar2);
                                unsafe2.putObject(obj2, j, zzabpVar2.zzc);
                                i18 |= i25;
                                i13 = i2;
                                iZzi = iZza;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 12:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            if (i22 != 0) {
                                i8 = iZzk;
                                i9 = i18;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                int iZzj = zzabq.zzj(bArr2, iZzk, zzabpVar2);
                                unsafe2.putInt(obj2, j, zzabpVar2.zza);
                                i18 |= i25;
                                i13 = i2;
                                iZzi = iZzj;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 15:
                            i5 = i21;
                            zzabpVar2 = zzabpVar;
                            i7 = iZzy;
                            if (i22 != 0) {
                                i8 = iZzk;
                                i9 = i18;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                iZzi = zzabq.zzj(bArr2, iZzk, zzabpVar2);
                                unsafe2.putInt(obj2, j, zzacg.zzs(zzabpVar2.zza));
                                i18 |= i25;
                                i13 = i2;
                                i17 = i7;
                                i16 = i5;
                                i15 = -1;
                                i14 = 1048575;
                            }
                            break;
                        case 16:
                            if (i22 != 0) {
                                i5 = i21;
                                i7 = iZzy;
                                i8 = iZzk;
                                i9 = i18;
                                i18 = i9;
                                unsafe = unsafe2;
                                i6 = i7;
                                i4 = i8;
                            } else {
                                zzabpVar2 = zzabpVar;
                                int iZzm3 = zzabq.zzm(bArr2, iZzk, zzabpVar2);
                                unsafe2.putLong(obj, j, zzacg.zzt(zzabpVar2.zzb));
                                i18 |= i25;
                                i17 = iZzy;
                                iZzi = iZzm3;
                                i16 = i21;
                                i15 = -1;
                                i14 = 1048575;
                                i13 = i2;
                            }
                            break;
                        default:
                            i5 = i21;
                            i7 = iZzy;
                            i8 = iZzk;
                            i9 = i18;
                            i18 = i9;
                            unsafe = unsafe2;
                            i6 = i7;
                            i4 = i8;
                            break;
                    }
                } else {
                    i5 = i21;
                    int i27 = i18;
                    zzabpVar2 = zzabpVar;
                    int i28 = iZzy;
                    if (iZzB == 27) {
                        if (i22 == 2) {
                            zzadk zzadkVarZzd = (zzadk) unsafe2.getObject(obj2, j);
                            if (!zzadkVarZzd.zzc()) {
                                int size = zzadkVarZzd.size();
                                zzadkVarZzd = zzadkVarZzd.zzd(size == 0 ? 10 : size + size);
                                unsafe2.putObject(obj2, j, zzadkVarZzd);
                            }
                            iZzi = zzabq.zze(zzaenVar.zzF(i28), i3, bArr, iZzk, i2, zzadkVarZzd, zzabpVar);
                            i13 = i2;
                            i18 = i27;
                            i17 = i28;
                            i16 = i5;
                            i15 = -1;
                            i14 = 1048575;
                        } else {
                            i10 = iZzk;
                            i11 = i19;
                            i12 = i27;
                            unsafe = unsafe2;
                            i6 = i28;
                            i4 = i10;
                            i19 = i11;
                            i18 = i12;
                        }
                    } else if (iZzB <= 49) {
                        int i29 = iZzk;
                        int i30 = i19;
                        unsafe = unsafe2;
                        i6 = i28;
                        iZzi = zzw(obj, bArr, iZzk, i2, i3, i5, i22, i28, i23, iZzB, j, zzabpVar);
                        if (iZzi != i29) {
                            zzaenVar = this;
                            obj2 = obj;
                            bArr2 = bArr;
                            i13 = i2;
                            zzabpVar2 = zzabpVar;
                            i17 = i6;
                            i16 = i5;
                            i19 = i30;
                            i18 = i27;
                            unsafe2 = unsafe;
                            i15 = -1;
                            i14 = 1048575;
                        } else {
                            i4 = iZzi;
                            i19 = i30;
                            i18 = i27;
                        }
                    } else {
                        i10 = iZzk;
                        i11 = i19;
                        i12 = i27;
                        unsafe = unsafe2;
                        i6 = i28;
                        if (iZzB != 50) {
                            iZzi = zzu(obj, bArr, i10, i2, i3, i5, i22, i23, iZzB, j, i6, zzabpVar);
                            if (iZzi != i10) {
                                zzaenVar = this;
                                obj2 = obj;
                                bArr2 = bArr;
                                i13 = i2;
                                zzabpVar2 = zzabpVar;
                                i17 = i6;
                                i16 = i5;
                                i19 = i11;
                                i18 = i12;
                                unsafe2 = unsafe;
                                i15 = -1;
                                i14 = 1048575;
                            } else {
                                i4 = iZzi;
                                i19 = i11;
                                i18 = i12;
                            }
                        } else if (i22 == 2) {
                            iZzi = zzt(obj, bArr, i10, i2, i6, j, zzabpVar);
                            if (iZzi != i10) {
                                zzaenVar = this;
                                obj2 = obj;
                                bArr2 = bArr;
                                i13 = i2;
                                zzabpVar2 = zzabpVar;
                                i17 = i6;
                                i16 = i5;
                                i19 = i11;
                                i18 = i12;
                                unsafe2 = unsafe;
                                i15 = -1;
                                i14 = 1048575;
                            } else {
                                i4 = iZzi;
                                i19 = i11;
                                i18 = i12;
                            }
                        } else {
                            i4 = i10;
                            i19 = i11;
                            i18 = i12;
                        }
                    }
                }
            }
            iZzi = zzabq.zzi(i3, bArr, i4, i2, zzd(obj), zzabpVar);
            zzaenVar = this;
            obj2 = obj;
            bArr2 = bArr;
            i13 = i2;
            zzabpVar2 = zzabpVar;
            i17 = i6;
            i16 = i5;
            unsafe2 = unsafe;
            i15 = -1;
            i14 = 1048575;
        }
        int i31 = i18;
        Unsafe unsafe3 = unsafe2;
        if (i19 != 1048575) {
            unsafe3.putInt(obj, i19, i31);
        }
        if (iZzi == i2) {
            return iZzi;
        }
        throw zzadn.zzg();
    }

    private final int zzw(Object obj, byte[] bArr, int i, int i2, int i3, int i4, int i5, int i6, long j, int i7, long j2, zzabp zzabpVar) throws IOException {
        int iZzl;
        int iZzj = i;
        Unsafe unsafe = zzb;
        zzadk zzadkVarZzd = (zzadk) unsafe.getObject(obj, j2);
        if (!zzadkVarZzd.zzc()) {
            int size = zzadkVarZzd.size();
            zzadkVarZzd = zzadkVarZzd.zzd(size == 0 ? 10 : size + size);
            unsafe.putObject(obj, j2, zzadkVarZzd);
        }
        switch (i7) {
            case 18:
            case 35:
                if (i5 == 2) {
                    zzacp zzacpVar = (zzacp) zzadkVarZzd;
                    int iZzj2 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i8 = zzabpVar.zza + iZzj2;
                    while (iZzj2 < i8) {
                        zzacpVar.zze(Double.longBitsToDouble(zzabq.zzp(bArr, iZzj2)));
                        iZzj2 += 8;
                    }
                    if (iZzj2 == i8) {
                        return iZzj2;
                    }
                    throw zzadn.zzi();
                }
                if (i5 == 1) {
                    zzacp zzacpVar2 = (zzacp) zzadkVarZzd;
                    zzacpVar2.zze(Double.longBitsToDouble(zzabq.zzp(bArr, i)));
                    int i9 = iZzj + 8;
                    while (i9 < i2) {
                        int iZzj3 = zzabq.zzj(bArr, i9, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return i9;
                        }
                        zzacpVar2.zze(Double.longBitsToDouble(zzabq.zzp(bArr, iZzj3)));
                        i9 = iZzj3 + 8;
                    }
                    return i9;
                }
                break;
            case 19:
            case 36:
                if (i5 == 2) {
                    zzacz zzaczVar = (zzacz) zzadkVarZzd;
                    int iZzj4 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i10 = zzabpVar.zza + iZzj4;
                    while (iZzj4 < i10) {
                        zzaczVar.zze(Float.intBitsToFloat(zzabq.zzb(bArr, iZzj4)));
                        iZzj4 += 4;
                    }
                    if (iZzj4 == i10) {
                        return iZzj4;
                    }
                    throw zzadn.zzi();
                }
                if (i5 == 5) {
                    zzacz zzaczVar2 = (zzacz) zzadkVarZzd;
                    zzaczVar2.zze(Float.intBitsToFloat(zzabq.zzb(bArr, i)));
                    int i11 = iZzj + 4;
                    while (i11 < i2) {
                        int iZzj5 = zzabq.zzj(bArr, i11, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return i11;
                        }
                        zzaczVar2.zze(Float.intBitsToFloat(zzabq.zzb(bArr, iZzj5)));
                        i11 = iZzj5 + 4;
                    }
                    return i11;
                }
                break;
            case 20:
            case 21:
            case 37:
            case 38:
                if (i5 == 2) {
                    zzadz zzadzVar = (zzadz) zzadkVarZzd;
                    int iZzj6 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i12 = zzabpVar.zza + iZzj6;
                    while (iZzj6 < i12) {
                        iZzj6 = zzabq.zzm(bArr, iZzj6, zzabpVar);
                        zzadzVar.zzf(zzabpVar.zzb);
                    }
                    if (iZzj6 == i12) {
                        return iZzj6;
                    }
                    throw zzadn.zzi();
                }
                if (i5 == 0) {
                    zzadz zzadzVar2 = (zzadz) zzadkVarZzd;
                    int iZzm = zzabq.zzm(bArr, iZzj, zzabpVar);
                    zzadzVar2.zzf(zzabpVar.zzb);
                    while (iZzm < i2) {
                        int iZzj7 = zzabq.zzj(bArr, iZzm, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return iZzm;
                        }
                        iZzm = zzabq.zzm(bArr, iZzj7, zzabpVar);
                        zzadzVar2.zzf(zzabpVar.zzb);
                    }
                    return iZzm;
                }
                break;
            case 22:
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
            case 39:
            case 43:
                if (i5 == 2) {
                    return zzabq.zzf(bArr, iZzj, zzadkVarZzd, zzabpVar);
                }
                if (i5 == 0) {
                    return zzabq.zzl(i3, bArr, i, i2, zzadkVarZzd, zzabpVar);
                }
                break;
            case 23:
            case 32:
            case 40:
            case 46:
                if (i5 == 2) {
                    zzadz zzadzVar3 = (zzadz) zzadkVarZzd;
                    int iZzj8 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i13 = zzabpVar.zza + iZzj8;
                    while (iZzj8 < i13) {
                        zzadzVar3.zzf(zzabq.zzp(bArr, iZzj8));
                        iZzj8 += 8;
                    }
                    if (iZzj8 == i13) {
                        return iZzj8;
                    }
                    throw zzadn.zzi();
                }
                if (i5 == 1) {
                    zzadz zzadzVar4 = (zzadz) zzadkVarZzd;
                    zzadzVar4.zzf(zzabq.zzp(bArr, i));
                    int i14 = iZzj + 8;
                    while (i14 < i2) {
                        int iZzj9 = zzabq.zzj(bArr, i14, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return i14;
                        }
                        zzadzVar4.zzf(zzabq.zzp(bArr, iZzj9));
                        i14 = iZzj9 + 8;
                    }
                    return i14;
                }
                break;
            case 24:
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
            case 41:
            case 45:
                if (i5 == 2) {
                    zzadg zzadgVar = (zzadg) zzadkVarZzd;
                    int iZzj10 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i15 = zzabpVar.zza + iZzj10;
                    while (iZzj10 < i15) {
                        zzadgVar.zzf(zzabq.zzb(bArr, iZzj10));
                        iZzj10 += 4;
                    }
                    if (iZzj10 == i15) {
                        return iZzj10;
                    }
                    throw zzadn.zzi();
                }
                if (i5 == 5) {
                    zzadg zzadgVar2 = (zzadg) zzadkVarZzd;
                    zzadgVar2.zzf(zzabq.zzb(bArr, i));
                    int i16 = iZzj + 4;
                    while (i16 < i2) {
                        int iZzj11 = zzabq.zzj(bArr, i16, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return i16;
                        }
                        zzadgVar2.zzf(zzabq.zzb(bArr, iZzj11));
                        i16 = iZzj11 + 4;
                    }
                    return i16;
                }
                break;
            case 25:
            case 42:
                if (i5 == 2) {
                    zzabr zzabrVar = (zzabr) zzadkVarZzd;
                    int iZzj12 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i17 = zzabpVar.zza + iZzj12;
                    while (iZzj12 < i17) {
                        iZzj12 = zzabq.zzm(bArr, iZzj12, zzabpVar);
                        zzabrVar.zze(zzabpVar.zzb != 0);
                    }
                    if (iZzj12 == i17) {
                        return iZzj12;
                    }
                    throw zzadn.zzi();
                }
                if (i5 == 0) {
                    zzabr zzabrVar2 = (zzabr) zzadkVarZzd;
                    int iZzm2 = zzabq.zzm(bArr, iZzj, zzabpVar);
                    zzabrVar2.zze(zzabpVar.zzb != 0);
                    while (iZzm2 < i2) {
                        int iZzj13 = zzabq.zzj(bArr, iZzm2, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return iZzm2;
                        }
                        iZzm2 = zzabq.zzm(bArr, iZzj13, zzabpVar);
                        zzabrVar2.zze(zzabpVar.zzb != 0);
                    }
                    return iZzm2;
                }
                break;
            case 26:
                if (i5 == 2) {
                    if ((j & 536870912) == 0) {
                        iZzj = zzabq.zzj(bArr, iZzj, zzabpVar);
                        int i18 = zzabpVar.zza;
                        if (i18 < 0) {
                            throw zzadn.zzf();
                        }
                        if (i18 == 0) {
                            zzadkVarZzd.add("");
                        } else {
                            zzadkVarZzd.add(new String(bArr, iZzj, i18, zzadl.zzb));
                            iZzj += i18;
                        }
                        while (iZzj < i2) {
                            int iZzj14 = zzabq.zzj(bArr, iZzj, zzabpVar);
                            if (i3 != zzabpVar.zza) {
                                break;
                            } else {
                                iZzj = zzabq.zzj(bArr, iZzj14, zzabpVar);
                                int i19 = zzabpVar.zza;
                                if (i19 < 0) {
                                    throw zzadn.zzf();
                                }
                                if (i19 == 0) {
                                    zzadkVarZzd.add("");
                                } else {
                                    zzadkVarZzd.add(new String(bArr, iZzj, i19, zzadl.zzb));
                                    iZzj += i19;
                                }
                            }
                        }
                    } else {
                        iZzj = zzabq.zzj(bArr, iZzj, zzabpVar);
                        int i20 = zzabpVar.zza;
                        if (i20 < 0) {
                            throw zzadn.zzf();
                        }
                        if (i20 == 0) {
                            zzadkVarZzd.add("");
                        } else {
                            int i21 = iZzj + i20;
                            if (!zzagc.zzf(bArr, iZzj, i21)) {
                                throw zzadn.zzd();
                            }
                            zzadkVarZzd.add(new String(bArr, iZzj, i20, zzadl.zzb));
                            iZzj = i21;
                        }
                        while (iZzj < i2) {
                            int iZzj15 = zzabq.zzj(bArr, iZzj, zzabpVar);
                            if (i3 != zzabpVar.zza) {
                                break;
                            } else {
                                iZzj = zzabq.zzj(bArr, iZzj15, zzabpVar);
                                int i22 = zzabpVar.zza;
                                if (i22 < 0) {
                                    throw zzadn.zzf();
                                }
                                if (i22 == 0) {
                                    zzadkVarZzd.add("");
                                } else {
                                    int i23 = iZzj + i22;
                                    if (!zzagc.zzf(bArr, iZzj, i23)) {
                                        throw zzadn.zzd();
                                    }
                                    zzadkVarZzd.add(new String(bArr, iZzj, i22, zzadl.zzb));
                                    iZzj = i23;
                                }
                            }
                        }
                    }
                }
                break;
            case 27:
                if (i5 == 2) {
                    return zzabq.zze(zzF(i6), i3, bArr, i, i2, zzadkVarZzd, zzabpVar);
                }
                break;
            case 28:
                if (i5 == 2) {
                    int iZzj16 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i24 = zzabpVar.zza;
                    if (i24 < 0) {
                        throw zzadn.zzf();
                    }
                    if (i24 > bArr.length - iZzj16) {
                        throw zzadn.zzi();
                    }
                    if (i24 == 0) {
                        zzadkVarZzd.add(zzacc.zzb);
                    } else {
                        zzadkVarZzd.add(zzacc.zzo(bArr, iZzj16, i24));
                        iZzj16 += i24;
                    }
                    while (iZzj16 < i2) {
                        int iZzj17 = zzabq.zzj(bArr, iZzj16, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return iZzj16;
                        }
                        iZzj16 = zzabq.zzj(bArr, iZzj17, zzabpVar);
                        int i25 = zzabpVar.zza;
                        if (i25 < 0) {
                            throw zzadn.zzf();
                        }
                        if (i25 > bArr.length - iZzj16) {
                            throw zzadn.zzi();
                        }
                        if (i25 == 0) {
                            zzadkVarZzd.add(zzacc.zzb);
                        } else {
                            zzadkVarZzd.add(zzacc.zzo(bArr, iZzj16, i25));
                            iZzj16 += i25;
                        }
                    }
                    return iZzj16;
                }
                break;
            case 30:
            case 44:
                if (i5 == 2) {
                    iZzl = zzabq.zzf(bArr, iZzj, zzadkVarZzd, zzabpVar);
                } else if (i5 == 0) {
                    iZzl = zzabq.zzl(i3, bArr, i, i2, zzadkVarZzd, zzabpVar);
                }
                zzaey.zzC(obj, i4, zzadkVarZzd, zzE(i6), null, this.zzo);
                return iZzl;
            case 33:
            case 47:
                if (i5 == 2) {
                    zzadg zzadgVar3 = (zzadg) zzadkVarZzd;
                    int iZzj18 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i26 = zzabpVar.zza + iZzj18;
                    while (iZzj18 < i26) {
                        iZzj18 = zzabq.zzj(bArr, iZzj18, zzabpVar);
                        zzadgVar3.zzf(zzacg.zzs(zzabpVar.zza));
                    }
                    if (iZzj18 == i26) {
                        return iZzj18;
                    }
                    throw zzadn.zzi();
                }
                if (i5 == 0) {
                    zzadg zzadgVar4 = (zzadg) zzadkVarZzd;
                    int iZzj19 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    zzadgVar4.zzf(zzacg.zzs(zzabpVar.zza));
                    while (iZzj19 < i2) {
                        int iZzj20 = zzabq.zzj(bArr, iZzj19, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return iZzj19;
                        }
                        iZzj19 = zzabq.zzj(bArr, iZzj20, zzabpVar);
                        zzadgVar4.zzf(zzacg.zzs(zzabpVar.zza));
                    }
                    return iZzj19;
                }
                break;
            case 34:
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                if (i5 == 2) {
                    zzadz zzadzVar5 = (zzadz) zzadkVarZzd;
                    int iZzj21 = zzabq.zzj(bArr, iZzj, zzabpVar);
                    int i27 = zzabpVar.zza + iZzj21;
                    while (iZzj21 < i27) {
                        iZzj21 = zzabq.zzm(bArr, iZzj21, zzabpVar);
                        zzadzVar5.zzf(zzacg.zzt(zzabpVar.zzb));
                    }
                    if (iZzj21 == i27) {
                        return iZzj21;
                    }
                    throw zzadn.zzi();
                }
                if (i5 == 0) {
                    zzadz zzadzVar6 = (zzadz) zzadkVarZzd;
                    int iZzm3 = zzabq.zzm(bArr, iZzj, zzabpVar);
                    zzadzVar6.zzf(zzacg.zzt(zzabpVar.zzb));
                    while (iZzm3 < i2) {
                        int iZzj22 = zzabq.zzj(bArr, iZzm3, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return iZzm3;
                        }
                        iZzm3 = zzabq.zzm(bArr, iZzj22, zzabpVar);
                        zzadzVar6.zzf(zzacg.zzt(zzabpVar.zzb));
                    }
                    return iZzm3;
                }
                break;
            default:
                if (i5 == 3) {
                    zzaew zzaewVarZzF = zzF(i6);
                    int i28 = (i3 & (-8)) | 4;
                    int iZzc = zzabq.zzc(zzaewVarZzF, bArr, i, i2, i28, zzabpVar);
                    zzadkVarZzd.add(zzabpVar.zzc);
                    while (iZzc < i2) {
                        int iZzj23 = zzabq.zzj(bArr, iZzc, zzabpVar);
                        if (i3 != zzabpVar.zza) {
                            return iZzc;
                        }
                        iZzc = zzabq.zzc(zzaewVarZzF, bArr, iZzj23, i2, i28, zzabpVar);
                        zzadkVarZzd.add(zzabpVar.zzc);
                    }
                    return iZzc;
                }
                break;
        }
        return iZzj;
    }

    private final int zzx(int i) {
        if (i < this.zze || i > this.zzf) {
            return -1;
        }
        return zzA(i, 0);
    }

    private final int zzy(int i, int i2) {
        if (i < this.zze || i > this.zzf) {
            return -1;
        }
        return zzA(i, i2);
    }

    private final int zzz(int i) {
        return this.zzc[i + 2];
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final int zza(Object obj) {
        return this.zzj ? zzr(obj) : zzq(obj);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final int zzb(Object obj) {
        int length = this.zzc.length;
        int iZzc = 0;
        for (int i = 0; i < length; i += 3) {
            int iZzC = zzC(i);
            int i2 = this.zzc[i];
            long j = 1048575 & iZzC;
            switch (zzB(iZzC)) {
                case 0:
                    iZzc = (iZzc * 53) + zzadl.zzc(Double.doubleToLongBits(zzafx.zza(obj, j)));
                    break;
                case 1:
                    iZzc = (iZzc * 53) + Float.floatToIntBits(zzafx.zzb(obj, j));
                    break;
                case 2:
                    iZzc = (iZzc * 53) + zzadl.zzc(zzafx.zzd(obj, j));
                    break;
                case 3:
                    iZzc = (iZzc * 53) + zzadl.zzc(zzafx.zzd(obj, j));
                    break;
                case 4:
                    iZzc = (iZzc * 53) + zzafx.zzc(obj, j);
                    break;
                case 5:
                    iZzc = (iZzc * 53) + zzadl.zzc(zzafx.zzd(obj, j));
                    break;
                case 6:
                    iZzc = (iZzc * 53) + zzafx.zzc(obj, j);
                    break;
                case 7:
                    iZzc = (iZzc * 53) + zzadl.zza(zzafx.zzw(obj, j));
                    break;
                case 8:
                    iZzc = (iZzc * 53) + ((String) zzafx.zzf(obj, j)).hashCode();
                    break;
                case 9:
                    Object objZzf = zzafx.zzf(obj, j);
                    iZzc = (iZzc * 53) + (objZzf != null ? objZzf.hashCode() : 37);
                    break;
                case 10:
                    iZzc = (iZzc * 53) + zzafx.zzf(obj, j).hashCode();
                    break;
                case 11:
                    iZzc = (iZzc * 53) + zzafx.zzc(obj, j);
                    break;
                case 12:
                    iZzc = (iZzc * 53) + zzafx.zzc(obj, j);
                    break;
                case 13:
                    iZzc = (iZzc * 53) + zzafx.zzc(obj, j);
                    break;
                case 14:
                    iZzc = (iZzc * 53) + zzadl.zzc(zzafx.zzd(obj, j));
                    break;
                case 15:
                    iZzc = (iZzc * 53) + zzafx.zzc(obj, j);
                    break;
                case 16:
                    iZzc = (iZzc * 53) + zzadl.zzc(zzafx.zzd(obj, j));
                    break;
                case 17:
                    Object objZzf2 = zzafx.zzf(obj, j);
                    iZzc = (iZzc * 53) + (objZzf2 != null ? objZzf2.hashCode() : 37);
                    break;
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                case 24:
                case 25:
                case 26:
                case 27:
                case 28:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                case 30:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                case 32:
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                case 38:
                case 39:
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                case 47:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                    iZzc = (iZzc * 53) + zzafx.zzf(obj, j).hashCode();
                    break;
                case 50:
                    iZzc = (iZzc * 53) + zzafx.zzf(obj, j).hashCode();
                    break;
                case 51:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzadl.zzc(Double.doubleToLongBits(zzo(obj, j)));
                    }
                    break;
                case 52:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + Float.floatToIntBits(zzp(obj, j));
                    }
                    break;
                case 53:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzadl.zzc(zzD(obj, j));
                    }
                    break;
                case 54:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzadl.zzc(zzD(obj, j));
                    }
                    break;
                case 55:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzs(obj, j);
                    }
                    break;
                case 56:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzadl.zzc(zzD(obj, j));
                    }
                    break;
                case 57:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzs(obj, j);
                    }
                    break;
                case 58:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzadl.zza(zzaa(obj, j));
                    }
                    break;
                case 59:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + ((String) zzafx.zzf(obj, j)).hashCode();
                    }
                    break;
                case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzafx.zzf(obj, j).hashCode();
                    }
                    break;
                case LockFreeTaskQueueCore.CLOSED_SHIFT /* 61 */:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzafx.zzf(obj, j).hashCode();
                    }
                    break;
                case 62:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzs(obj, j);
                    }
                    break;
                case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzs(obj, j);
                    }
                    break;
                case 64:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzs(obj, j);
                    }
                    break;
                case 65:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzadl.zzc(zzD(obj, j));
                    }
                    break;
                case 66:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzs(obj, j);
                    }
                    break;
                case 67:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzadl.zzc(zzD(obj, j));
                    }
                    break;
                case 68:
                    if (zzZ(obj, i2, i)) {
                        iZzc = (iZzc * 53) + zzafx.zzf(obj, j).hashCode();
                    }
                    break;
            }
        }
        int iHashCode = (iZzc * 53) + this.zzo.zzd(obj).hashCode();
        if (!this.zzh) {
            return iHashCode;
        }
        this.zzp.zza(obj);
        throw null;
    }

    /* JADX WARN: Code restructure failed: missing block: B:150:0x052f, code lost:
    
        if (r0 == 1048575) goto L152;
     */
    /* JADX WARN: Code restructure failed: missing block: B:151:0x0531, code lost:
    
        r27.putInt(r12, r0, r5);
     */
    /* JADX WARN: Code restructure failed: missing block: B:152:0x0537, code lost:
    
        r10 = r9.zzl;
     */
    /* JADX WARN: Code restructure failed: missing block: B:154:0x053c, code lost:
    
        if (r10 >= r9.zzm) goto L255;
     */
    /* JADX WARN: Code restructure failed: missing block: B:155:0x053e, code lost:
    
        zzG(r29, r9.zzk[r10], null, r9.zzo, r29);
        r10 = r10 + 1;
     */
    /* JADX WARN: Code restructure failed: missing block: B:156:0x0551, code lost:
    
        if (r7 != 0) goto L162;
     */
    /* JADX WARN: Code restructure failed: missing block: B:158:0x0555, code lost:
    
        if (r6 != r32) goto L160;
     */
    /* JADX WARN: Code restructure failed: missing block: B:161:0x055c, code lost:
    
        throw com.google.android.gms.internal.p001firebaseauthapi.zzadn.zzg();
     */
    /* JADX WARN: Code restructure failed: missing block: B:163:0x055f, code lost:
    
        if (r6 > r32) goto L166;
     */
    /* JADX WARN: Code restructure failed: missing block: B:164:0x0561, code lost:
    
        if (r8 != r7) goto L166;
     */
    /* JADX WARN: Code restructure failed: missing block: B:165:0x0563, code lost:
    
        return r6;
     */
    /* JADX WARN: Code restructure failed: missing block: B:167:0x0568, code lost:
    
        throw com.google.android.gms.internal.p001firebaseauthapi.zzadn.zzg();
     */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final int zzc(java.lang.Object r29, byte[] r30, int r31, int r32, int r33, com.google.android.gms.internal.p001firebaseauthapi.zzabp r34) throws java.io.IOException {
        /*
            Method dump skipped, instruction units count: 1424
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzaen.zzc(java.lang.Object, byte[], int, int, int, com.google.android.gms.internal.firebase-auth-api.zzabp):int");
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final Object zze() {
        return ((zzadf) this.zzg).zzw();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzf(Object obj) {
        if (zzY(obj)) {
            if (obj instanceof zzadf) {
                zzadf zzadfVar = (zzadf) obj;
                zzadfVar.zzH(Integer.MAX_VALUE);
                zzadfVar.zza = 0;
                zzadfVar.zzF();
            }
            int length = this.zzc.length;
            for (int i = 0; i < length; i += 3) {
                int iZzC = zzC(i);
                long j = 1048575 & iZzC;
                switch (zzB(iZzC)) {
                    case 9:
                    case 17:
                        if (zzV(obj, i)) {
                            zzF(i).zzf(zzb.getObject(obj, j));
                        }
                        break;
                    case 18:
                    case 19:
                    case 20:
                    case 21:
                    case 22:
                    case 23:
                    case 24:
                    case 25:
                    case 26:
                    case 27:
                    case 28:
                    case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                    case 30:
                    case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                    case 32:
                    case 33:
                    case 34:
                    case 35:
                    case 36:
                    case 37:
                    case 38:
                    case 39:
                    case 40:
                    case 41:
                    case 42:
                    case 43:
                    case 44:
                    case 45:
                    case 46:
                    case 47:
                    case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                    case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                        this.zzn.zzb(obj, j);
                        break;
                    case 50:
                        Unsafe unsafe = zzb;
                        Object object = unsafe.getObject(obj, j);
                        if (object != null) {
                            ((zzaee) object).zzc();
                            unsafe.putObject(obj, j, object);
                        }
                        break;
                }
            }
            this.zzo.zzm(obj);
            if (this.zzh) {
                this.zzp.zze(obj);
            }
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzg(Object obj, Object obj2) {
        zzL(obj);
        if (obj2 == null) {
            throw null;
        }
        for (int i = 0; i < this.zzc.length; i += 3) {
            int iZzC = zzC(i);
            long j = 1048575 & iZzC;
            int i2 = this.zzc[i];
            switch (zzB(iZzC)) {
                case 0:
                    if (zzV(obj2, i)) {
                        zzafx.zzo(obj, j, zzafx.zza(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 1:
                    if (zzV(obj2, i)) {
                        zzafx.zzp(obj, j, zzafx.zzb(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 2:
                    if (zzV(obj2, i)) {
                        zzafx.zzr(obj, j, zzafx.zzd(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 3:
                    if (zzV(obj2, i)) {
                        zzafx.zzr(obj, j, zzafx.zzd(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 4:
                    if (zzV(obj2, i)) {
                        zzafx.zzq(obj, j, zzafx.zzc(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 5:
                    if (zzV(obj2, i)) {
                        zzafx.zzr(obj, j, zzafx.zzd(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 6:
                    if (zzV(obj2, i)) {
                        zzafx.zzq(obj, j, zzafx.zzc(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 7:
                    if (zzV(obj2, i)) {
                        zzafx.zzm(obj, j, zzafx.zzw(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 8:
                    if (zzV(obj2, i)) {
                        zzafx.zzs(obj, j, zzafx.zzf(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 9:
                    zzM(obj, obj2, i);
                    break;
                case 10:
                    if (zzV(obj2, i)) {
                        zzafx.zzs(obj, j, zzafx.zzf(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 11:
                    if (zzV(obj2, i)) {
                        zzafx.zzq(obj, j, zzafx.zzc(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 12:
                    if (zzV(obj2, i)) {
                        zzafx.zzq(obj, j, zzafx.zzc(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 13:
                    if (zzV(obj2, i)) {
                        zzafx.zzq(obj, j, zzafx.zzc(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 14:
                    if (zzV(obj2, i)) {
                        zzafx.zzr(obj, j, zzafx.zzd(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 15:
                    if (zzV(obj2, i)) {
                        zzafx.zzq(obj, j, zzafx.zzc(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 16:
                    if (zzV(obj2, i)) {
                        zzafx.zzr(obj, j, zzafx.zzd(obj2, j));
                        zzP(obj, i);
                    }
                    break;
                case 17:
                    zzM(obj, obj2, i);
                    break;
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                case 24:
                case 25:
                case 26:
                case 27:
                case 28:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                case 30:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                case 32:
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                case 38:
                case 39:
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                case 47:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                    this.zzn.zzc(obj, obj2, j);
                    break;
                case 50:
                    zzaey.zzI(this.zzr, obj, obj2, j);
                    break;
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                case 58:
                case 59:
                    if (zzZ(obj2, i2, i)) {
                        zzafx.zzs(obj, j, zzafx.zzf(obj2, j));
                        zzQ(obj, i2, i);
                    }
                    break;
                case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                    zzN(obj, obj2, i);
                    break;
                case LockFreeTaskQueueCore.CLOSED_SHIFT /* 61 */:
                case 62:
                case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                case 64:
                case 65:
                case 66:
                case 67:
                    if (zzZ(obj2, i2, i)) {
                        zzafx.zzs(obj, j, zzafx.zzf(obj2, j));
                        zzQ(obj, i2, i);
                    }
                    break;
                case 68:
                    zzN(obj, obj2, i);
                    break;
            }
        }
        zzaey.zzF(this.zzo, obj, obj2);
        if (this.zzh) {
            zzaey.zzE(this.zzp, obj, obj2);
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:195:0x074c A[Catch: all -> 0x0781, TRY_LEAVE, TryCatch #1 {all -> 0x0781, blocks: (B:193:0x0747, B:195:0x074c), top: B:228:0x0747 }] */
    /* JADX WARN: Removed duplicated region for block: B:206:0x0777  */
    /* JADX WARN: Removed duplicated region for block: B:221:0x0796 A[LOOP:3: B:219:0x0792->B:221:0x0796, LOOP_END] */
    /* JADX WARN: Removed duplicated region for block: B:223:0x07aa  */
    /* JADX WARN: Removed duplicated region for block: B:329:0x0757 A[SYNTHETIC] */
    /* JADX WARN: Removed duplicated region for block: B:345:? A[SYNTHETIC] */
    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void zzh(java.lang.Object r18, com.google.android.gms.internal.p001firebaseauthapi.zzaev r19, com.google.android.gms.internal.p001firebaseauthapi.zzacs r20) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 2110
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzaen.zzh(java.lang.Object, com.google.android.gms.internal.firebase-auth-api.zzaev, com.google.android.gms.internal.firebase-auth-api.zzacs):void");
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzi(Object obj, byte[] bArr, int i, int i2, zzabp zzabpVar) throws IOException {
        if (this.zzj) {
            zzv(obj, bArr, i, i2, zzabpVar);
        } else {
            zzc(obj, bArr, i, i2, 0, zzabpVar);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final boolean zzj(Object obj, Object obj2) {
        boolean zZzH;
        int length = this.zzc.length;
        for (int i = 0; i < length; i += 3) {
            int iZzC = zzC(i);
            long j = iZzC & 1048575;
            switch (zzB(iZzC)) {
                case 0:
                    if (!zzT(obj, obj2, i) || Double.doubleToLongBits(zzafx.zza(obj, j)) != Double.doubleToLongBits(zzafx.zza(obj2, j))) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 1:
                    if (!zzT(obj, obj2, i) || Float.floatToIntBits(zzafx.zzb(obj, j)) != Float.floatToIntBits(zzafx.zzb(obj2, j))) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 2:
                    if (!zzT(obj, obj2, i) || zzafx.zzd(obj, j) != zzafx.zzd(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 3:
                    if (!zzT(obj, obj2, i) || zzafx.zzd(obj, j) != zzafx.zzd(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 4:
                    if (!zzT(obj, obj2, i) || zzafx.zzc(obj, j) != zzafx.zzc(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 5:
                    if (!zzT(obj, obj2, i) || zzafx.zzd(obj, j) != zzafx.zzd(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 6:
                    if (!zzT(obj, obj2, i) || zzafx.zzc(obj, j) != zzafx.zzc(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 7:
                    if (!zzT(obj, obj2, i) || zzafx.zzw(obj, j) != zzafx.zzw(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 8:
                    if (!zzT(obj, obj2, i) || !zzaey.zzH(zzafx.zzf(obj, j), zzafx.zzf(obj2, j))) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 9:
                    if (!zzT(obj, obj2, i) || !zzaey.zzH(zzafx.zzf(obj, j), zzafx.zzf(obj2, j))) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 10:
                    if (!zzT(obj, obj2, i) || !zzaey.zzH(zzafx.zzf(obj, j), zzafx.zzf(obj2, j))) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 11:
                    if (!zzT(obj, obj2, i) || zzafx.zzc(obj, j) != zzafx.zzc(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 12:
                    if (!zzT(obj, obj2, i) || zzafx.zzc(obj, j) != zzafx.zzc(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 13:
                    if (!zzT(obj, obj2, i) || zzafx.zzc(obj, j) != zzafx.zzc(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 14:
                    if (!zzT(obj, obj2, i) || zzafx.zzd(obj, j) != zzafx.zzd(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 15:
                    if (!zzT(obj, obj2, i) || zzafx.zzc(obj, j) != zzafx.zzc(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 16:
                    if (!zzT(obj, obj2, i) || zzafx.zzd(obj, j) != zzafx.zzd(obj2, j)) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 17:
                    if (!zzT(obj, obj2, i) || !zzaey.zzH(zzafx.zzf(obj, j), zzafx.zzf(obj2, j))) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                case 24:
                case 25:
                case 26:
                case 27:
                case 28:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                case 30:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                case 32:
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                case 38:
                case 39:
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                case 47:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                    zZzH = zzaey.zzH(zzafx.zzf(obj, j), zzafx.zzf(obj2, j));
                    break;
                case 50:
                    zZzH = zzaey.zzH(zzafx.zzf(obj, j), zzafx.zzf(obj2, j));
                    break;
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                case 58:
                case 59:
                case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                case LockFreeTaskQueueCore.CLOSED_SHIFT /* 61 */:
                case 62:
                case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                case 64:
                case 65:
                case 66:
                case 67:
                case 68:
                    long jZzz = zzz(i) & 1048575;
                    if (zzafx.zzc(obj, jZzz) != zzafx.zzc(obj2, jZzz) || !zzaey.zzH(zzafx.zzf(obj, j), zzafx.zzf(obj2, j))) {
                        return false;
                    }
                    continue;
                    break;
                    break;
                default:
                    break;
            }
            if (!zZzH) {
                return false;
            }
        }
        if (!this.zzo.zzd(obj).equals(this.zzo.zzd(obj2))) {
            return false;
        }
        if (!this.zzh) {
            return true;
        }
        this.zzp.zza(obj);
        this.zzp.zza(obj2);
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final boolean zzk(Object obj) {
        int i;
        int i2;
        int i3 = 1048575;
        int i4 = 0;
        int i5 = 0;
        while (i5 < this.zzl) {
            int i6 = this.zzk[i5];
            int i7 = this.zzc[i6];
            int iZzC = zzC(i6);
            int i8 = this.zzc[i6 + 2];
            int i9 = i8 & 1048575;
            int i10 = 1 << (i8 >>> 20);
            if (i9 == i3) {
                i = i3;
                i2 = i4;
            } else if (i9 != 1048575) {
                i2 = zzb.getInt(obj, i9);
                i = i9;
            } else {
                i2 = i4;
                i = i9;
            }
            if ((268435456 & iZzC) != 0 && !zzW(obj, i6, i, i2, i10)) {
                return false;
            }
            switch (zzB(iZzC)) {
                case 9:
                case 17:
                    if (zzW(obj, i6, i, i2, i10) && !zzX(obj, iZzC, zzF(i6))) {
                        return false;
                    }
                    break;
                    break;
                case 27:
                case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                    List list = (List) zzafx.zzf(obj, iZzC & 1048575);
                    if (list.isEmpty()) {
                        continue;
                    } else {
                        zzaew zzaewVarZzF = zzF(i6);
                        for (int i11 = 0; i11 < list.size(); i11++) {
                            if (!zzaewVarZzF.zzk(list.get(i11))) {
                                return false;
                            }
                        }
                    }
                    break;
                case 50:
                    if (!((zzaee) zzafx.zzf(obj, iZzC & 1048575)).isEmpty()) {
                        throw null;
                    }
                    break;
                    break;
                case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                case 68:
                    if (zzZ(obj, i7, i6) && !zzX(obj, iZzC, zzF(i6))) {
                        return false;
                    }
                    break;
                    break;
            }
            i5++;
            i3 = i;
            i4 = i2;
        }
        if (!this.zzh) {
            return true;
        }
        this.zzp.zza(obj);
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzn(Object obj, zzaco zzacoVar) throws IOException {
        if (!this.zzj) {
            zzab(obj, zzacoVar);
            return;
        }
        if (this.zzh) {
            this.zzp.zza(obj);
            throw null;
        }
        int length = this.zzc.length;
        for (int i = 0; i < length; i += 3) {
            int iZzC = zzC(i);
            int i2 = this.zzc[i];
            switch (zzB(iZzC)) {
                case 0:
                    if (zzV(obj, i)) {
                        zzacoVar.zzf(i2, zzafx.zza(obj, iZzC & 1048575));
                    }
                    break;
                case 1:
                    if (zzV(obj, i)) {
                        zzacoVar.zzo(i2, zzafx.zzb(obj, iZzC & 1048575));
                    }
                    break;
                case 2:
                    if (zzV(obj, i)) {
                        zzacoVar.zzt(i2, zzafx.zzd(obj, iZzC & 1048575));
                    }
                    break;
                case 3:
                    if (zzV(obj, i)) {
                        zzacoVar.zzJ(i2, zzafx.zzd(obj, iZzC & 1048575));
                    }
                    break;
                case 4:
                    if (zzV(obj, i)) {
                        zzacoVar.zzr(i2, zzafx.zzc(obj, iZzC & 1048575));
                    }
                    break;
                case 5:
                    if (zzV(obj, i)) {
                        zzacoVar.zzm(i2, zzafx.zzd(obj, iZzC & 1048575));
                    }
                    break;
                case 6:
                    if (zzV(obj, i)) {
                        zzacoVar.zzk(i2, zzafx.zzc(obj, iZzC & 1048575));
                    }
                    break;
                case 7:
                    if (zzV(obj, i)) {
                        zzacoVar.zzb(i2, zzafx.zzw(obj, iZzC & 1048575));
                    }
                    break;
                case 8:
                    if (zzV(obj, i)) {
                        zzad(i2, zzafx.zzf(obj, iZzC & 1048575), zzacoVar);
                    }
                    break;
                case 9:
                    if (zzV(obj, i)) {
                        zzacoVar.zzv(i2, zzafx.zzf(obj, iZzC & 1048575), zzF(i));
                    }
                    break;
                case 10:
                    if (zzV(obj, i)) {
                        zzacoVar.zzd(i2, (zzacc) zzafx.zzf(obj, iZzC & 1048575));
                    }
                    break;
                case 11:
                    if (zzV(obj, i)) {
                        zzacoVar.zzH(i2, zzafx.zzc(obj, iZzC & 1048575));
                    }
                    break;
                case 12:
                    if (zzV(obj, i)) {
                        zzacoVar.zzi(i2, zzafx.zzc(obj, iZzC & 1048575));
                    }
                    break;
                case 13:
                    if (zzV(obj, i)) {
                        zzacoVar.zzw(i2, zzafx.zzc(obj, iZzC & 1048575));
                    }
                    break;
                case 14:
                    if (zzV(obj, i)) {
                        zzacoVar.zzy(i2, zzafx.zzd(obj, iZzC & 1048575));
                    }
                    break;
                case 15:
                    if (zzV(obj, i)) {
                        zzacoVar.zzA(i2, zzafx.zzc(obj, iZzC & 1048575));
                    }
                    break;
                case 16:
                    if (zzV(obj, i)) {
                        zzacoVar.zzC(i2, zzafx.zzd(obj, iZzC & 1048575));
                    }
                    break;
                case 17:
                    if (zzV(obj, i)) {
                        zzacoVar.zzq(i2, zzafx.zzf(obj, iZzC & 1048575), zzF(i));
                    }
                    break;
                case 18:
                    zzaey.zzL(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 19:
                    zzaey.zzP(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 20:
                    zzaey.zzS(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 21:
                    zzaey.zzaa(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 22:
                    zzaey.zzR(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 23:
                    zzaey.zzO(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 24:
                    zzaey.zzN(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 25:
                    zzaey.zzJ(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 26:
                    zzaey.zzY(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar);
                    break;
                case 27:
                    zzaey.zzT(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, zzF(i));
                    break;
                case 28:
                    zzaey.zzK(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                    zzaey.zzZ(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 30:
                    zzaey.zzM(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                    zzaey.zzU(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 32:
                    zzaey.zzV(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 33:
                    zzaey.zzW(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 34:
                    zzaey.zzX(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, false);
                    break;
                case 35:
                    zzaey.zzL(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 36:
                    zzaey.zzP(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 37:
                    zzaey.zzS(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 38:
                    zzaey.zzaa(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 39:
                    zzaey.zzR(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 40:
                    zzaey.zzO(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 41:
                    zzaey.zzN(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 42:
                    zzaey.zzJ(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 43:
                    zzaey.zzZ(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 44:
                    zzaey.zzM(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 45:
                    zzaey.zzU(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 46:
                    zzaey.zzV(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case 47:
                    zzaey.zzW(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                    zzaey.zzX(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, true);
                    break;
                case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                    zzaey.zzQ(i2, (List) zzafx.zzf(obj, iZzC & 1048575), zzacoVar, zzF(i));
                    break;
                case 50:
                    zzac(zzacoVar, i2, zzafx.zzf(obj, iZzC & 1048575), i);
                    break;
                case 51:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzf(i2, zzo(obj, iZzC & 1048575));
                    }
                    break;
                case 52:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzo(i2, zzp(obj, iZzC & 1048575));
                    }
                    break;
                case 53:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzt(i2, zzD(obj, iZzC & 1048575));
                    }
                    break;
                case 54:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzJ(i2, zzD(obj, iZzC & 1048575));
                    }
                    break;
                case 55:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzr(i2, zzs(obj, iZzC & 1048575));
                    }
                    break;
                case 56:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzm(i2, zzD(obj, iZzC & 1048575));
                    }
                    break;
                case 57:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzk(i2, zzs(obj, iZzC & 1048575));
                    }
                    break;
                case 58:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzb(i2, zzaa(obj, iZzC & 1048575));
                    }
                    break;
                case 59:
                    if (zzZ(obj, i2, i)) {
                        zzad(i2, zzafx.zzf(obj, iZzC & 1048575), zzacoVar);
                    }
                    break;
                case LockFreeTaskQueueCore.FROZEN_SHIFT /* 60 */:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzv(i2, zzafx.zzf(obj, iZzC & 1048575), zzF(i));
                    }
                    break;
                case LockFreeTaskQueueCore.CLOSED_SHIFT /* 61 */:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzd(i2, (zzacc) zzafx.zzf(obj, iZzC & 1048575));
                    }
                    break;
                case 62:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzH(i2, zzs(obj, iZzC & 1048575));
                    }
                    break;
                case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzi(i2, zzs(obj, iZzC & 1048575));
                    }
                    break;
                case 64:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzw(i2, zzs(obj, iZzC & 1048575));
                    }
                    break;
                case 65:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzy(i2, zzD(obj, iZzC & 1048575));
                    }
                    break;
                case 66:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzA(i2, zzs(obj, iZzC & 1048575));
                    }
                    break;
                case 67:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzC(i2, zzD(obj, iZzC & 1048575));
                    }
                    break;
                case 68:
                    if (zzZ(obj, i2, i)) {
                        zzacoVar.zzq(i2, zzafx.zzf(obj, iZzC & 1048575), zzF(i));
                    }
                    break;
            }
        }
        zzafn zzafnVar = this.zzo;
        zzafnVar.zzr(zzafnVar.zzd(obj), zzacoVar);
    }
}
