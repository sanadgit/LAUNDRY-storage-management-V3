package com.google.android.gms.internal.measurement;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzjk extends zziu {
    private static final Logger zzb = Logger.getLogger(zzjk.class.getName());
    private static final boolean zzc = zzmr.zza();
    zzjl zza;

    private zzjk() {
    }

    /* synthetic */ zzjk(zzjh zzjhVar) {
    }

    public static int zzA(zzjd zzjdVar) {
        int iZzc = zzjdVar.zzc();
        return zzw(iZzc) + iZzc;
    }

    static int zzB(zzli zzliVar, zzlt zzltVar) {
        zzio zzioVar = (zzio) zzliVar;
        int iZzbq = zzioVar.zzbq();
        if (iZzbq == -1) {
            iZzbq = zzltVar.zze(zzioVar);
            zzioVar.zzbr(iZzbq);
        }
        return zzw(iZzbq) + iZzbq;
    }

    @Deprecated
    static int zzE(int i, zzli zzliVar, zzlt zzltVar) {
        int iZzw = zzw(i << 3);
        int i2 = iZzw + iZzw;
        zzio zzioVar = (zzio) zzliVar;
        int iZzbq = zzioVar.zzbq();
        if (iZzbq == -1) {
            iZzbq = zzltVar.zze(zzioVar);
            zzioVar.zzbr(iZzbq);
        }
        return i2 + iZzbq;
    }

    public static zzjk zzt(byte[] bArr) {
        return new zzji(bArr, 0, bArr.length);
    }

    public static int zzu(int i) {
        return zzw(i << 3);
    }

    public static int zzv(int i) {
        if (i >= 0) {
            return zzw(i);
        }
        return 10;
    }

    public static int zzw(int i) {
        if ((i & (-128)) == 0) {
            return 1;
        }
        if ((i & (-16384)) == 0) {
            return 2;
        }
        if (((-2097152) & i) == 0) {
            return 3;
        }
        return (i & (-268435456)) == 0 ? 4 : 5;
    }

    public static int zzx(long j) {
        int i;
        if (((-128) & j) == 0) {
            return 1;
        }
        if (j < 0) {
            return 10;
        }
        if (((-34359738368L) & j) != 0) {
            j >>>= 28;
            i = 6;
        } else {
            i = 2;
        }
        if (((-2097152) & j) != 0) {
            i += 2;
            j >>>= 14;
        }
        return (j & (-16384)) != 0 ? i + 1 : i;
    }

    public static int zzy(String str) {
        int length;
        try {
            length = zzmw.zzc(str);
        } catch (zzmv e) {
            length = str.getBytes(zzkl.zza).length;
        }
        return zzw(length) + length;
    }

    public static int zzz(zzkq zzkqVar) {
        int iZza = zzkqVar.zza();
        return zzw(iZza) + iZza;
    }

    public final void zzC() {
        if (zzs() != 0) {
            throw new IllegalStateException("Did not write as much data as expected.");
        }
    }

    final void zzD(String str, zzmv zzmvVar) throws IOException {
        zzb.logp(Level.WARNING, "com.google.protobuf.CodedOutputStream", "inefficientWriteStringNoTag", "Converting ill-formed UTF-16. Your Protocol Buffer will not round trip correctly!", (Throwable) zzmvVar);
        byte[] bytes = str.getBytes(zzkl.zza);
        try {
            int length = bytes.length;
            zzl(length);
            zzq(bytes, 0, length);
        } catch (zzjj e) {
            throw e;
        } catch (IndexOutOfBoundsException e2) {
            throw new zzjj(e2);
        }
    }

    public abstract void zza(int i, int i2) throws IOException;

    public abstract void zzb(int i, int i2) throws IOException;

    public abstract void zzc(int i, int i2) throws IOException;

    public abstract void zzd(int i, int i2) throws IOException;

    public abstract void zze(int i, long j) throws IOException;

    public abstract void zzf(int i, long j) throws IOException;

    public abstract void zzg(int i, boolean z) throws IOException;

    public abstract void zzh(int i, String str) throws IOException;

    public abstract void zzi(int i, zzjd zzjdVar) throws IOException;

    public abstract void zzj(byte b) throws IOException;

    public abstract void zzk(int i) throws IOException;

    public abstract void zzl(int i) throws IOException;

    public abstract void zzm(int i) throws IOException;

    public abstract void zzn(long j) throws IOException;

    public abstract void zzo(long j) throws IOException;

    public abstract void zzq(byte[] bArr, int i, int i2) throws IOException;

    public abstract int zzs();
}
