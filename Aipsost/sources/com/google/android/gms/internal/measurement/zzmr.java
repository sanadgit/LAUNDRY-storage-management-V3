package com.google.android.gms.internal.measurement;

import java.lang.reflect.Field;
import java.nio.Buffer;
import java.nio.ByteOrder;
import java.security.AccessController;
import java.util.logging.Level;
import java.util.logging.Logger;
import sun.misc.Unsafe;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzmr {
    static final long zza;
    static final boolean zzb;
    private static final Unsafe zzc;
    private static final Class<?> zzd;
    private static final boolean zze;
    private static final boolean zzf;
    private static final zzmq zzg;
    private static final boolean zzh;
    private static final boolean zzi;

    static {
        Unsafe unsafe;
        boolean z;
        Unsafe unsafe2;
        boolean z2;
        zzmq zzmqVar;
        Unsafe unsafeZzq = zzq();
        zzc = unsafeZzq;
        zzd = zziq.zza();
        boolean zZzr = zzr(Long.TYPE);
        zze = zZzr;
        boolean zZzr2 = zzr(Integer.TYPE);
        zzf = zZzr2;
        zzmq zzmoVar = null;
        if (unsafeZzq != null) {
            if (zZzr) {
                zzmoVar = new zzmp(unsafeZzq);
            } else if (zZzr2) {
                zzmoVar = new zzmo(unsafeZzq);
            }
        }
        zzg = zzmoVar;
        if (zzmoVar == null || (unsafe = zzmoVar.zza) == null) {
            z = false;
        } else {
            try {
                Class<?> cls = unsafe.getClass();
                cls.getMethod("objectFieldOffset", Field.class);
                cls.getMethod("getLong", Object.class, Long.TYPE);
                z = zzB() != null;
            } catch (Throwable th) {
                zzs(th);
                z = false;
            }
        }
        zzh = z;
        zzmq zzmqVar2 = zzg;
        if (zzmqVar2 == null || (unsafe2 = zzmqVar2.zza) == null) {
            z2 = false;
        } else {
            try {
                Class<?> cls2 = unsafe2.getClass();
                cls2.getMethod("objectFieldOffset", Field.class);
                cls2.getMethod("arrayBaseOffset", Class.class);
                cls2.getMethod("arrayIndexScale", Class.class);
                cls2.getMethod("getInt", Object.class, Long.TYPE);
                cls2.getMethod("putInt", Object.class, Long.TYPE, Integer.TYPE);
                cls2.getMethod("getLong", Object.class, Long.TYPE);
                cls2.getMethod("putLong", Object.class, Long.TYPE, Long.TYPE);
                cls2.getMethod("getObject", Object.class, Long.TYPE);
                cls2.getMethod("putObject", Object.class, Long.TYPE, Object.class);
                z2 = true;
            } catch (Throwable th2) {
                zzs(th2);
                z2 = false;
            }
        }
        zzi = z2;
        zza = zzz(byte[].class);
        zzz(boolean[].class);
        zzA(boolean[].class);
        zzz(int[].class);
        zzA(int[].class);
        zzz(long[].class);
        zzA(long[].class);
        zzz(float[].class);
        zzA(float[].class);
        zzz(double[].class);
        zzA(double[].class);
        zzz(Object[].class);
        zzA(Object[].class);
        Field fieldZzB = zzB();
        if (fieldZzB != null && (zzmqVar = zzg) != null) {
            zzmqVar.zzh(fieldZzB);
        }
        zzb = ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN;
    }

    private zzmr() {
    }

    private static int zzA(Class<?> cls) {
        if (zzi) {
            return zzg.zzj(cls);
        }
        return -1;
    }

    private static Field zzB() {
        int i = zziq.zza;
        Field fieldZzC = zzC(Buffer.class, "effectiveDirectAddress");
        if (fieldZzC != null) {
            return fieldZzC;
        }
        Field fieldZzC2 = zzC(Buffer.class, "address");
        if (fieldZzC2 == null || fieldZzC2.getType() != Long.TYPE) {
            return null;
        }
        return fieldZzC2;
    }

    private static Field zzC(Class<?> cls, String str) {
        try {
            return cls.getDeclaredField(str);
        } catch (Throwable th) {
            return null;
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static void zzD(Object obj, long j, byte b) {
        long j2 = (-4) & j;
        zzmq zzmqVar = zzg;
        int iZzk = zzmqVar.zzk(obj, j2);
        int i = ((~((int) j)) & 3) << 3;
        zzmqVar.zzl(obj, j2, ((255 & b) << i) | (iZzk & (~(255 << i))));
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static void zzE(Object obj, long j, byte b) {
        long j2 = (-4) & j;
        zzmq zzmqVar = zzg;
        int i = (((int) j) & 3) << 3;
        zzmqVar.zzl(obj, j2, ((255 & b) << i) | (zzmqVar.zzk(obj, j2) & (~(255 << i))));
    }

    static boolean zza() {
        return zzi;
    }

    static boolean zzb() {
        return zzh;
    }

    static <T> T zzc(Class<T> cls) {
        try {
            return (T) zzc.allocateInstance(cls);
        } catch (InstantiationException e) {
            throw new IllegalStateException(e);
        }
    }

    static int zzd(Object obj, long j) {
        return zzg.zzk(obj, j);
    }

    static void zze(Object obj, long j, int i) {
        zzg.zzl(obj, j, i);
    }

    static long zzf(Object obj, long j) {
        return zzg.zzm(obj, j);
    }

    static void zzg(Object obj, long j, long j2) {
        zzg.zzn(obj, j, j2);
    }

    static boolean zzh(Object obj, long j) {
        return zzg.zzb(obj, j);
    }

    static void zzi(Object obj, long j, boolean z) {
        zzg.zzc(obj, j, z);
    }

    static float zzj(Object obj, long j) {
        return zzg.zzd(obj, j);
    }

    static void zzk(Object obj, long j, float f) {
        zzg.zze(obj, j, f);
    }

    static double zzl(Object obj, long j) {
        return zzg.zzf(obj, j);
    }

    static void zzm(Object obj, long j, double d) {
        zzg.zzg(obj, j, d);
    }

    static Object zzn(Object obj, long j) {
        return zzg.zzo(obj, j);
    }

    static void zzo(Object obj, long j, Object obj2) {
        zzg.zzp(obj, j, obj2);
    }

    static void zzp(byte[] bArr, long j, byte b) {
        zzg.zza(bArr, zza + j, b);
    }

    static Unsafe zzq() {
        try {
            return (Unsafe) AccessController.doPrivileged(new zzmn());
        } catch (Throwable th) {
            return null;
        }
    }

    static boolean zzr(Class<?> cls) {
        int i = zziq.zza;
        try {
            Class<?> cls2 = zzd;
            cls2.getMethod("peekLong", cls, Boolean.TYPE);
            cls2.getMethod("pokeLong", cls, Long.TYPE, Boolean.TYPE);
            cls2.getMethod("pokeInt", cls, Integer.TYPE, Boolean.TYPE);
            cls2.getMethod("peekInt", cls, Boolean.TYPE);
            cls2.getMethod("pokeByte", cls, Byte.TYPE);
            cls2.getMethod("peekByte", cls);
            cls2.getMethod("pokeByteArray", cls, byte[].class, Integer.TYPE, Integer.TYPE);
            cls2.getMethod("peekByteArray", cls, byte[].class, Integer.TYPE, Integer.TYPE);
            return true;
        } catch (Throwable th) {
            return false;
        }
    }

    static /* synthetic */ void zzs(Throwable th) {
        Logger logger = Logger.getLogger(zzmr.class.getName());
        Level level = Level.WARNING;
        String strValueOf = String.valueOf(th);
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 71);
        sb.append("platform method missing - proto runtime falling back to safer methods: ");
        sb.append(strValueOf);
        logger.logp(level, "com.google.protobuf.UnsafeUtil", "logMissingMethod", sb.toString());
    }

    static /* synthetic */ boolean zzv(Object obj, long j) {
        return ((byte) ((zzg.zzk(obj, (-4) & j) >>> ((int) (((~j) & 3) << 3))) & 255)) != 0;
    }

    static /* synthetic */ boolean zzw(Object obj, long j) {
        return ((byte) ((zzg.zzk(obj, (-4) & j) >>> ((int) ((j & 3) << 3))) & 255)) != 0;
    }

    private static int zzz(Class<?> cls) {
        if (zzi) {
            return zzg.zzi(cls);
        }
        return -1;
    }
}
