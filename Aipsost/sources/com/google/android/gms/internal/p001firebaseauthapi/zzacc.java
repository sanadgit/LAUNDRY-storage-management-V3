package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;
import java.io.Serializable;
import java.nio.charset.Charset;
import java.util.Comparator;
import java.util.Iterator;
import java.util.Locale;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzacc implements Iterable, Serializable {
    private static final Comparator zza;
    public static final zzacc zzb = new zzabz(zzadl.zzd);
    private static final zzacb zzd;
    private int zzc = 0;

    static {
        int i = zzabo.zza;
        zzd = new zzacb(null);
        zza = new zzabu();
    }

    zzacc() {
    }

    static int zzl(int i, int i2, int i3) {
        int i4 = i2 - i;
        if ((i | i2 | i4 | (i3 - i2)) >= 0) {
            return i4;
        }
        if (i < 0) {
            throw new IndexOutOfBoundsException("Beginning index: " + i + " < 0");
        }
        if (i2 < i) {
            throw new IndexOutOfBoundsException("Beginning index larger than ending index: " + i + ", " + i2);
        }
        throw new IndexOutOfBoundsException("End index: " + i2 + " >= " + i3);
    }

    public static zzacc zzn(byte[] bArr) {
        return zzo(bArr, 0, bArr.length);
    }

    public static zzacc zzo(byte[] bArr, int i, int i2) {
        zzl(i, i + i2, bArr.length);
        byte[] bArr2 = new byte[i2];
        System.arraycopy(bArr, i, bArr2, 0, i2);
        return new zzabz(bArr2);
    }

    public static zzacc zzp(String str) {
        return new zzabz(str.getBytes(zzadl.zzb));
    }

    static zzacc zzq(byte[] bArr) {
        return new zzabz(bArr);
    }

    public abstract boolean equals(Object obj);

    public final int hashCode() {
        int iZzf = this.zzc;
        if (iZzf == 0) {
            int iZzd = zzd();
            iZzf = zzf(iZzd, 0, iZzd);
            if (iZzf == 0) {
                iZzf = 1;
            }
            this.zzc = iZzf;
        }
        return iZzf;
    }

    @Override // java.lang.Iterable
    public final /* synthetic */ Iterator iterator() {
        return new zzabt(this);
    }

    public final String toString() {
        Locale locale = Locale.ROOT;
        Object[] objArr = new Object[3];
        objArr[0] = Integer.toHexString(System.identityHashCode(this));
        objArr[1] = Integer.valueOf(zzd());
        objArr[2] = zzd() <= 50 ? zzafl.zza(this) : zzafl.zza(zzg(0, 47)).concat("...");
        return String.format(locale, "<ByteString@%s size=%d contents=\"%s\">", objArr);
    }

    public abstract byte zza(int i);

    abstract byte zzb(int i);

    public abstract int zzd();

    protected abstract void zze(byte[] bArr, int i, int i2, int i3);

    protected abstract int zzf(int i, int i2, int i3);

    public abstract zzacc zzg(int i, int i2);

    public abstract zzacg zzh();

    protected abstract String zzi(Charset charset);

    abstract void zzj(zzabs zzabsVar) throws IOException;

    public abstract boolean zzk();

    protected final int zzm() {
        return this.zzc;
    }

    public final String zzr(Charset charset) {
        return zzd() == 0 ? "" : zzi(charset);
    }

    public final boolean zzs() {
        return zzd() == 0;
    }

    public final byte[] zzt() {
        int iZzd = zzd();
        if (iZzd == 0) {
            return zzadl.zzd;
        }
        byte[] bArr = new byte[iZzd];
        zze(bArr, 0, 0, iZzd);
        return bArr;
    }
}
