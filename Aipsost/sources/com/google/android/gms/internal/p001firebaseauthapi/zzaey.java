package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaey {
    private static final Class zza;
    private static final zzafn zzb;
    private static final zzafn zzc;
    private static final zzafn zzd;

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
        zzd = new zzafp();
    }

    public static zzafn zzA() {
        return zzc;
    }

    public static zzafn zzB() {
        return zzd;
    }

    static Object zzC(Object obj, int i, List list, zzadj zzadjVar, Object obj2, zzafn zzafnVar) {
        if (zzadjVar == null) {
            return obj2;
        }
        if (list instanceof RandomAccess) {
            int size = list.size();
            int i2 = 0;
            for (int i3 = 0; i3 < size; i3++) {
                int iIntValue = ((Integer) list.get(i3)).intValue();
                if (zzadjVar.zza()) {
                    if (i3 != i2) {
                        list.set(i2, Integer.valueOf(iIntValue));
                    }
                    i2++;
                } else {
                    obj2 = zzD(obj, i, iIntValue, obj2, zzafnVar);
                }
            }
            if (i2 != size) {
                list.subList(i2, size).clear();
                return obj2;
            }
        } else {
            Iterator it = list.iterator();
            while (it.hasNext()) {
                int iIntValue2 = ((Integer) it.next()).intValue();
                if (!zzadjVar.zza()) {
                    obj2 = zzD(obj, i, iIntValue2, obj2, zzafnVar);
                    it.remove();
                }
            }
        }
        return obj2;
    }

    static Object zzD(Object obj, int i, int i2, Object obj2, zzafn zzafnVar) {
        if (obj2 == null) {
            obj2 = zzafnVar.zzc(obj);
        }
        zzafnVar.zzl(obj2, i, i2);
        return obj2;
    }

    static void zzE(zzact zzactVar, Object obj, Object obj2) {
        zzactVar.zza(obj2);
        throw null;
    }

    static void zzF(zzafn zzafnVar, Object obj, Object obj2) {
        zzafnVar.zzo(obj, zzafnVar.zze(zzafnVar.zzd(obj), zzafnVar.zzd(obj2)));
    }

    public static void zzG(Class cls) {
        Class cls2;
        if (!zzadf.class.isAssignableFrom(cls) && (cls2 = zza) != null && !cls2.isAssignableFrom(cls)) {
            throw new IllegalArgumentException("Message classes must extend GeneratedMessage or GeneratedMessageLite");
        }
    }

    static boolean zzH(Object obj, Object obj2) {
        if (obj != obj2) {
            return obj != null && obj.equals(obj2);
        }
        return true;
    }

    static void zzI(zzaef zzaefVar, Object obj, Object obj2, long j) {
        zzafx.zzs(obj, j, zzaef.zzc(zzafx.zzf(obj, j), zzafx.zzf(obj2, j)));
    }

    public static void zzJ(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzc(i, list, z);
    }

    public static void zzK(int i, List list, zzaco zzacoVar) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zze(i, list);
    }

    public static void zzL(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzg(i, list, z);
    }

    public static void zzM(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzj(i, list, z);
    }

    public static void zzN(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzl(i, list, z);
    }

    public static void zzO(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzn(i, list, z);
    }

    public static void zzP(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzp(i, list, z);
    }

    public static void zzQ(int i, List list, zzaco zzacoVar, zzaew zzaewVar) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        for (int i2 = 0; i2 < list.size(); i2++) {
            zzacoVar.zzq(i, list.get(i2), zzaewVar);
        }
    }

    public static void zzR(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzs(i, list, z);
    }

    public static void zzS(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzu(i, list, z);
    }

    public static void zzT(int i, List list, zzaco zzacoVar, zzaew zzaewVar) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        for (int i2 = 0; i2 < list.size(); i2++) {
            zzacoVar.zzv(i, list.get(i2), zzaewVar);
        }
    }

    public static void zzU(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzx(i, list, z);
    }

    public static void zzV(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzz(i, list, z);
    }

    public static void zzW(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzB(i, list, z);
    }

    public static void zzX(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzD(i, list, z);
    }

    public static void zzY(int i, List list, zzaco zzacoVar) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzG(i, list);
    }

    public static void zzZ(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzI(i, list, z);
    }

    static int zza(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return size * (zzacn.zzE(i << 3) + 1);
    }

    public static void zzaa(int i, List list, zzaco zzacoVar, boolean z) throws IOException {
        if (list == null || list.isEmpty()) {
            return;
        }
        zzacoVar.zzK(i, list, z);
    }

    private static zzafn zzab(boolean z) {
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
            return (zzafn) cls.getConstructor(Boolean.TYPE).newInstance(Boolean.valueOf(z));
        } catch (Throwable th2) {
            return null;
        }
    }

    static int zzb(List list) {
        return list.size();
    }

    static int zzc(int i, List list) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        int iZzD = size * zzacn.zzD(i);
        for (int i2 = 0; i2 < list.size(); i2++) {
            iZzD += zzacn.zzw((zzacc) list.get(i2));
        }
        return iZzD;
    }

    static int zzd(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zze(list) + (size * zzacn.zzD(i));
    }

    static int zze(List list) {
        int iZzy;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzadg) {
            zzadg zzadgVar = (zzadg) list;
            iZzy = 0;
            while (i < size) {
                iZzy += zzacn.zzy(zzadgVar.zze(i));
                i++;
            }
        } else {
            iZzy = 0;
            while (i < size) {
                iZzy += zzacn.zzy(((Integer) list.get(i)).intValue());
                i++;
            }
        }
        return iZzy;
    }

    static int zzf(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return size * (zzacn.zzE(i << 3) + 4);
    }

    static int zzg(List list) {
        return list.size() * 4;
    }

    static int zzh(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return size * (zzacn.zzE(i << 3) + 8);
    }

    static int zzi(List list) {
        return list.size() * 8;
    }

    static int zzj(int i, List list, zzaew zzaewVar) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        int iZzx = 0;
        for (int i2 = 0; i2 < size; i2++) {
            iZzx += zzacn.zzx(i, (zzaek) list.get(i2), zzaewVar);
        }
        return iZzx;
    }

    static int zzk(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzl(list) + (size * zzacn.zzD(i));
    }

    static int zzl(List list) {
        int iZzy;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzadg) {
            zzadg zzadgVar = (zzadg) list;
            iZzy = 0;
            while (i < size) {
                iZzy += zzacn.zzy(zzadgVar.zze(i));
                i++;
            }
        } else {
            iZzy = 0;
            while (i < size) {
                iZzy += zzacn.zzy(((Integer) list.get(i)).intValue());
                i++;
            }
        }
        return iZzy;
    }

    static int zzm(int i, List list, boolean z) {
        if (list.size() == 0) {
            return 0;
        }
        return zzn(list) + (list.size() * zzacn.zzD(i));
    }

    static int zzn(List list) {
        int iZzF;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzadz) {
            zzadz zzadzVar = (zzadz) list;
            iZzF = 0;
            while (i < size) {
                iZzF += zzacn.zzF(zzadzVar.zze(i));
                i++;
            }
        } else {
            iZzF = 0;
            while (i < size) {
                iZzF += zzacn.zzF(((Long) list.get(i)).longValue());
                i++;
            }
        }
        return iZzF;
    }

    static int zzo(int i, Object obj, zzaew zzaewVar) {
        if (!(obj instanceof zzadq)) {
            return zzacn.zzE(i << 3) + zzacn.zzA((zzaek) obj, zzaewVar);
        }
        int iZzE = zzacn.zzE(i << 3);
        int iZza = ((zzadq) obj).zza();
        return iZzE + zzacn.zzE(iZza) + iZza;
    }

    static int zzp(int i, List list, zzaew zzaewVar) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        int iZzD = zzacn.zzD(i) * size;
        for (int i2 = 0; i2 < size; i2++) {
            Object obj = list.get(i2);
            iZzD += obj instanceof zzadq ? zzacn.zzz((zzadq) obj) : zzacn.zzA((zzaek) obj, zzaewVar);
        }
        return iZzD;
    }

    static int zzq(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzr(list) + (size * zzacn.zzD(i));
    }

    static int zzr(List list) {
        int iZzE;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzadg) {
            zzadg zzadgVar = (zzadg) list;
            iZzE = 0;
            while (i < size) {
                int iZze = zzadgVar.zze(i);
                iZzE += zzacn.zzE((iZze >> 31) ^ (iZze + iZze));
                i++;
            }
        } else {
            iZzE = 0;
            while (i < size) {
                int iIntValue = ((Integer) list.get(i)).intValue();
                iZzE += zzacn.zzE((iIntValue >> 31) ^ (iIntValue + iIntValue));
                i++;
            }
        }
        return iZzE;
    }

    static int zzs(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzt(list) + (size * zzacn.zzD(i));
    }

    static int zzt(List list) {
        int iZzF;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzadz) {
            zzadz zzadzVar = (zzadz) list;
            iZzF = 0;
            while (i < size) {
                long jZze = zzadzVar.zze(i);
                iZzF += zzacn.zzF((jZze >> 63) ^ (jZze + jZze));
                i++;
            }
        } else {
            iZzF = 0;
            while (i < size) {
                long jLongValue = ((Long) list.get(i)).longValue();
                iZzF += zzacn.zzF((jLongValue >> 63) ^ (jLongValue + jLongValue));
                i++;
            }
        }
        return iZzF;
    }

    static int zzu(int i, List list) {
        int size = list.size();
        int i2 = 0;
        if (size == 0) {
            return 0;
        }
        int iZzD = zzacn.zzD(i) * size;
        if (list instanceof zzads) {
            zzads zzadsVar = (zzads) list;
            while (i2 < size) {
                Object objZzf = zzadsVar.zzf(i2);
                iZzD += objZzf instanceof zzacc ? zzacn.zzw((zzacc) objZzf) : zzacn.zzC((String) objZzf);
                i2++;
            }
        } else {
            while (i2 < size) {
                Object obj = list.get(i2);
                iZzD += obj instanceof zzacc ? zzacn.zzw((zzacc) obj) : zzacn.zzC((String) obj);
                i2++;
            }
        }
        return iZzD;
    }

    static int zzv(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzw(list) + (size * zzacn.zzD(i));
    }

    static int zzw(List list) {
        int iZzE;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzadg) {
            zzadg zzadgVar = (zzadg) list;
            iZzE = 0;
            while (i < size) {
                iZzE += zzacn.zzE(zzadgVar.zze(i));
                i++;
            }
        } else {
            iZzE = 0;
            while (i < size) {
                iZzE += zzacn.zzE(((Integer) list.get(i)).intValue());
                i++;
            }
        }
        return iZzE;
    }

    static int zzx(int i, List list, boolean z) {
        int size = list.size();
        if (size == 0) {
            return 0;
        }
        return zzy(list) + (size * zzacn.zzD(i));
    }

    static int zzy(List list) {
        int iZzF;
        int size = list.size();
        int i = 0;
        if (size == 0) {
            return 0;
        }
        if (list instanceof zzadz) {
            zzadz zzadzVar = (zzadz) list;
            iZzF = 0;
            while (i < size) {
                iZzF += zzacn.zzF(zzadzVar.zze(i));
                i++;
            }
        } else {
            iZzF = 0;
            while (i < size) {
                iZzF += zzacn.zzF(((Long) list.get(i)).longValue());
                i++;
            }
        }
        return iZzF;
    }

    public static zzafn zzz() {
        return zzb;
    }
}
