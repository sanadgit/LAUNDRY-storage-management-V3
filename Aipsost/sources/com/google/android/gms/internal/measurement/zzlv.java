package com.google.android.gms.internal.measurement;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzlv {
    private static final Class<?> zza;
    private static final zzmh<?, ?> zzb;
    private static final zzmh<?, ?> zzc;
    private static final zzmh<?, ?> zzd;

    static {
        Class<?> cls;
        try {
            cls = Class.forName("com.google.protobuf.GeneratedMessage");
        } catch (Throwable th) {
            cls = null;
        }
        zza = cls;
        zzb = zzab(false);
        zzc = zzab(true);
        zzd = new zzmj();
    }

    public static zzmh<?, ?> zzA() {
        return zzb;
    }

    public static zzmh<?, ?> zzB() {
        return zzc;
    }

    public static zzmh<?, ?> zzC() {
        return zzd;
    }

    static boolean zzD(Object obj, Object obj2) {
        if (obj != obj2) {
            return obj != null && obj.equals(obj2);
        }
        return true;
    }

    static <T, FT extends zzjt<FT>> void zzE(zzjq<FT> zzjqVar, T t, T t2) {
        zzjqVar.zzb(t2);
        throw null;
    }

    static <T, UT, UB> void zzF(zzmh<UT, UB> zzmhVar, T t, T t2) {
        zzmhVar.zzc(t, zzmhVar.zzf(zzmhVar.zzd(t), zzmhVar.zzd(t2)));
    }

    static <UT, UB> UB zzG(int i, List<Integer> list, zzkh zzkhVar, UB ub, zzmh<UT, UB> zzmhVar) {
        if (zzkhVar == null) {
            return ub;
        }
        if (list instanceof RandomAccess) {
            int size = list.size();
            int i2 = 0;
            for (int i3 = 0; i3 < size; i3++) {
                int iIntValue = list.get(i3).intValue();
                if (zzkhVar.zza(iIntValue)) {
                    if (i3 != i2) {
                        list.set(i2, Integer.valueOf(iIntValue));
                    }
                    i2++;
                } else {
                    ub = (UB) zzH(i, iIntValue, ub, zzmhVar);
                }
            }
            if (i2 != size) {
                list.subList(i2, size).clear();
                return ub;
            }
        } else {
            Iterator<Integer> it = list.iterator();
            while (it.hasNext()) {
                int iIntValue2 = it.next().intValue();
                if (!zzkhVar.zza(iIntValue2)) {
                    ub = (UB) zzH(i, iIntValue2, ub, zzmhVar);
                    it.remove();
                }
            }
        }
        return ub;
    }

    static <UT, UB> UB zzH(int i, int i2, UB ub, zzmh<UT, UB> zzmhVar) {
        if (ub == null) {
            ub = zzmhVar.zzb();
        }
        zzmhVar.zza(ub, i, i2);
        return ub;
    }

    static <T> void zzI(zzld zzldVar, T t, T t2, long j) {
        zzmr.zzo(t, j, zzld.zzb(zzmr.zzn(t, j), zzmr.zzn(t2, j)));
    }

    public static void zzJ(int i, List<Double> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzB(i, list, z);
    }

    public static void zzK(int i, List<Float> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzA(i, list, z);
    }

    public static void zzL(int i, List<Long> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzx(i, list, z);
    }

    public static void zzM(int i, List<Long> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzy(i, list, z);
    }

    public static void zzN(int i, List<Long> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzK(i, list, z);
    }

    public static void zzO(int i, List<Long> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzz(i, list, z);
    }

    public static void zzP(int i, List<Long> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzI(i, list, z);
    }

    public static void zzQ(int i, List<Integer> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzv(i, list, z);
    }

    public static void zzR(int i, List<Integer> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzG(i, list, z);
    }

    public static void zzS(int i, List<Integer> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzJ(i, list, z);
    }

    public static void zzT(int i, List<Integer> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzw(i, list, z);
    }

    public static void zzU(int i, List<Integer> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzH(i, list, z);
    }

    public static void zzV(int i, List<Integer> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzC(i, list, z);
    }

    public static void zzW(int i, List<Boolean> list, zzjl zzjlVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzD(i, list, z);
    }

    public static void zzX(int i, List<String> list, zzjl zzjlVar) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzE(i, list);
    }

    public static void zzY(int i, List<zzjd> list, zzjl zzjlVar) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzjlVar.zzF(i, list);
    }

    public static void zzZ(int i, List<?> list, zzjl zzjlVar, zzlt zzltVar) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        for (int i2 = 0; i2 < list.size(); i2++) {
            zzjlVar.zzr(i, list.get(i2), zzltVar);
        }
    }

    public static void zza(Class<?> cls) {
        Class<?> cls2;
        if (!zzkd.class.isAssignableFrom(cls) && (cls2 = zza) != null && !cls2.isAssignableFrom(cls)) {
            throw new IllegalArgumentException("Message classes must extend GeneratedMessage or GeneratedMessageLite");
        }
    }

    public static void zzaa(int i, List<?> list, zzjl zzjlVar, zzlt zzltVar) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        for (int i2 = 0; i2 < list.size(); i2++) {
            zzjlVar.zzs(i, list.get(i2), zzltVar);
        }
    }

    private static zzmh<?, ?> zzab(boolean z) {
        Class<?> cls;
        try {
            cls = Class.forName("com.google.protobuf.UnknownFieldSetSchema");
        } catch (Throwable th) {
            cls = null;
        }
        if (cls == null) {
            return null;
        }
        try {
            return (zzmh) cls.getConstructor(Boolean.TYPE).newInstance(Boolean.valueOf(z));
        } catch (Throwable th2) {
            return null;
        }
    }

    static int zzb(List<Long> list) {
        int iZzx;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzkx) {
            zzkx zzkxVar = (zzkx) list;
            iZzx = 0;
            while (i < size) {
                iZzx += zzjk.zzx(zzkxVar.zzc(i));
                i++;
            }
        } else {
            iZzx = 0;
            while (i < size) {
                iZzx += zzjk.zzx(list.get(i).longValue());
                i++;
            }
        }
        return iZzx;
    }

    static int zzc(int i, List<Long> list, boolean z) {
        if (list.size() == 0) {
            return 0;
        }
        return zzb(list) + (list.size() * zzjk.zzu(i));
    }

    static int zzd(List<Long> list) {
        int iZzx;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzkx) {
            zzkx zzkxVar = (zzkx) list;
            iZzx = 0;
            while (i < size) {
                iZzx += zzjk.zzx(zzkxVar.zzc(i));
                i++;
            }
        } else {
            iZzx = 0;
            while (i < size) {
                iZzx += zzjk.zzx(list.get(i).longValue());
                i++;
            }
        }
        return iZzx;
    }

    static int zze(int i, List<Long> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzd(list) + (size * zzjk.zzu(i));
    }

    static int zzf(List<Long> list) {
        int iZzx;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzkx) {
            zzkx zzkxVar = (zzkx) list;
            iZzx = 0;
            while (i < size) {
                long jZzc = zzkxVar.zzc(i);
                iZzx += zzjk.zzx((jZzc >> 63) ^ (jZzc + jZzc));
                i++;
            }
        } else {
            iZzx = 0;
            while (i < size) {
                long jLongValue = list.get(i).longValue();
                iZzx += zzjk.zzx((jLongValue >> 63) ^ (jLongValue + jLongValue));
                i++;
            }
        }
        return iZzx;
    }

    static int zzg(int i, List<Long> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzf(list) + (size * zzjk.zzu(i));
    }

    static int zzh(List<Integer> list) {
        int iZzv;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzke) {
            zzke zzkeVar = (zzke) list;
            iZzv = 0;
            while (i < size) {
                iZzv += zzjk.zzv(zzkeVar.zzg(i));
                i++;
            }
        } else {
            iZzv = 0;
            while (i < size) {
                iZzv += zzjk.zzv(list.get(i).intValue());
                i++;
            }
        }
        return iZzv;
    }

    static int zzi(int i, List<Integer> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzh(list) + (size * zzjk.zzu(i));
    }

    static int zzj(List<Integer> list) {
        int iZzv;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzke) {
            zzke zzkeVar = (zzke) list;
            iZzv = 0;
            while (i < size) {
                iZzv += zzjk.zzv(zzkeVar.zzg(i));
                i++;
            }
        } else {
            iZzv = 0;
            while (i < size) {
                iZzv += zzjk.zzv(list.get(i).intValue());
                i++;
            }
        }
        return iZzv;
    }

    static int zzk(int i, List<Integer> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzj(list) + (size * zzjk.zzu(i));
    }

    static int zzl(List<Integer> list) {
        int iZzw;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzke) {
            zzke zzkeVar = (zzke) list;
            iZzw = 0;
            while (i < size) {
                iZzw += zzjk.zzw(zzkeVar.zzg(i));
                i++;
            }
        } else {
            iZzw = 0;
            while (i < size) {
                iZzw += zzjk.zzw(list.get(i).intValue());
                i++;
            }
        }
        return iZzw;
    }

    static int zzm(int i, List<Integer> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzl(list) + (size * zzjk.zzu(i));
    }

    static int zzn(List<Integer> list) {
        int iZzw;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzke) {
            zzke zzkeVar = (zzke) list;
            iZzw = 0;
            while (i < size) {
                int iZzg = zzkeVar.zzg(i);
                iZzw += zzjk.zzw((iZzg >> 31) ^ (iZzg + iZzg));
                i++;
            }
        } else {
            iZzw = 0;
            while (i < size) {
                int iIntValue = list.get(i).intValue();
                iZzw += zzjk.zzw((iIntValue >> 31) ^ (iIntValue + iIntValue));
                i++;
            }
        }
        return iZzw;
    }

    static int zzo(int i, List<Integer> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzn(list) + (size * zzjk.zzu(i));
    }

    static int zzp(List<?> list) {
        return list.size() * 4;
    }

    static int zzq(int i, List<?> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return size * (zzjk.zzw(i << 3) + 4);
    }

    static int zzr(List<?> list) {
        return list.size() * 8;
    }

    static int zzs(int i, List<?> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return size * (zzjk.zzw(i << 3) + 8);
    }

    static int zzt(List<?> list) {
        return list.size();
    }

    static int zzu(int i, List<?> list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return size * (zzjk.zzw(i << 3) + 1);
    }

    static int zzv(int i, List<?> list) {
        int size = list.size();
        int i2 = 0;
        if (size == 0) {
            return 0;
        }
        int iZzu = zzjk.zzu(i) * size;
        if (list instanceof zzks) {
            zzks zzksVar = (zzks) list;
            while (i2 < size) {
                Object objZzg = zzksVar.zzg(i2);
                iZzu += objZzg instanceof zzjd ? zzjk.zzA((zzjd) objZzg) : zzjk.zzy((String) objZzg);
                i2++;
            }
        } else {
            while (i2 < size) {
                Object obj = list.get(i2);
                iZzu += obj instanceof zzjd ? zzjk.zzA((zzjd) obj) : zzjk.zzy((String) obj);
                i2++;
            }
        }
        return iZzu;
    }

    static int zzw(int i, Object obj, zzlt zzltVar) {
        if (!(obj instanceof zzkq)) {
            return zzjk.zzw(i << 3) + zzjk.zzB((zzli) obj, zzltVar);
        }
        int iZzw = zzjk.zzw(i << 3);
        int iZza = ((zzkq) obj).zza();
        return iZzw + zzjk.zzw(iZza) + iZza;
    }

    static int zzx(int i, List<?> list, zzlt zzltVar) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        int iZzu = zzjk.zzu(i) * size;
        for (int i2 = 0; i2 < size; i2++) {
            Object obj = list.get(i2);
            iZzu += obj instanceof zzkq ? zzjk.zzz((zzkq) obj) : zzjk.zzB((zzli) obj, zzltVar);
        }
        return iZzu;
    }

    static int zzy(int i, List<zzjd> list) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        int iZzu = size * zzjk.zzu(i);
        for (int i2 = 0; i2 < list.size(); i2++) {
            iZzu += zzjk.zzA(list.get(i2));
        }
        return iZzu;
    }

    static int zzz(int i, List<zzli> list, zzlt zzltVar) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        int iZzE = 0;
        for (int i2 = 0; i2 < size; i2++) {
            iZzE += zzjk.zzE(i, list.get(i2), zzltVar);
        }
        return iZzE;
    }
}
