package com.google.android.gms.internal.measurement;

import com.bumptech.glide.load.Key;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkl {
    static final Charset zza = Charset.forName(Key.STRING_CHARSET_NAME);
    static final Charset zzb = Charset.forName("ISO-8859-1");
    public static final byte[] zzc;
    public static final ByteBuffer zzd;
    public static final zzjg zze;

    static {
        byte[] bArr = new byte[0];
        zzc = bArr;
        zzd = ByteBuffer.wrap(bArr);
        zzjf zzjfVar = new zzjf(bArr, 0, 0, false, null);
        try {
            zzjfVar.zza(0);
            zze = zzjfVar;
        } catch (zzkn e) {
            throw new IllegalArgumentException(e);
        }
    }

    static <T> T zza(T t) {
        if (t != null) {
            return t;
        }
        throw null;
    }

    static <T> T zzb(T t, String str) {
        if (t != null) {
            return t;
        }
        throw new NullPointerException(str);
    }

    public static boolean zzc(byte[] bArr) {
        return zzmw.zza(bArr);
    }

    public static String zzd(byte[] bArr) {
        return new String(bArr, zza);
    }

    public static int zze(long j) {
        return (int) (j ^ (j >>> 32));
    }

    public static int zzf(boolean z) {
        return z ? 1231 : 1237;
    }

    public static int zzg(byte[] bArr) {
        int length = bArr.length;
        int iZzh = zzh(length, bArr, 0, length);
        if (iZzh == 0) {
            return 1;
        }
        return iZzh;
    }

    static int zzh(int i, byte[] bArr, int i2, int i3) {
        for (int i4 = 0; i4 < i3; i4++) {
            i = (i * 31) + bArr[i4];
        }
        return i;
    }

    static Object zzi(Object obj, Object obj2) {
        return ((zzli) obj).zzbG().zzau((zzli) obj2).zzaD();
    }
}
