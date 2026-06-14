package com.google.android.gms.internal.measurement;

import java.io.IOException;
import java.nio.charset.Charset;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
class zzjb extends zzja {
    protected final byte[] zza;

    zzjb(byte[] bArr) {
        if (bArr == null) {
            throw null;
        }
        this.zza = bArr;
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    public final boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }
        if (!(obj instanceof zzjd) || zzc() != ((zzjd) obj).zzc()) {
            return false;
        }
        if (zzc() == 0) {
            return true;
        }
        if (!(obj instanceof zzjb)) {
            return obj.equals(this);
        }
        zzjb zzjbVar = (zzjb) obj;
        int iZzm = zzm();
        int iZzm2 = zzjbVar.zzm();
        if (iZzm != 0 && iZzm2 != 0 && iZzm != iZzm2) {
            return false;
        }
        int iZzc = zzc();
        if (iZzc > zzjbVar.zzc()) {
            int iZzc2 = zzc();
            StringBuilder sb = new StringBuilder(40);
            sb.append("Length too large: ");
            sb.append(iZzc);
            sb.append(iZzc2);
            throw new IllegalArgumentException(sb.toString());
        }
        if (iZzc > zzjbVar.zzc()) {
            int iZzc3 = zzjbVar.zzc();
            StringBuilder sb2 = new StringBuilder(59);
            sb2.append("Ran off end of other: 0, ");
            sb2.append(iZzc);
            sb2.append(", ");
            sb2.append(iZzc3);
            throw new IllegalArgumentException(sb2.toString());
        }
        if (!(zzjbVar instanceof zzjb)) {
            return zzjbVar.zze(0, iZzc).equals(zze(0, iZzc));
        }
        byte[] bArr = this.zza;
        byte[] bArr2 = zzjbVar.zza;
        zzjbVar.zzd();
        int i = 0;
        int i2 = 0;
        while (i < iZzc) {
            if (bArr[i] != bArr2[i2]) {
                return false;
            }
            i++;
            i2++;
        }
        return true;
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    public byte zza(int i) {
        return this.zza[i];
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    byte zzb(int i) {
        return this.zza[i];
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    public int zzc() {
        return this.zza.length;
    }

    protected int zzd() {
        return 0;
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    public final zzjd zze(int i, int i2) {
        int iZzn = zzn(0, i2, zzc());
        return iZzn == 0 ? zzjd.zzb : new zziy(this.zza, 0, iZzn);
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    final void zzf(zziu zziuVar) throws IOException {
        ((zzji) zziuVar).zzp(this.zza, 0, zzc());
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    protected final String zzg(Charset charset) {
        return new String(this.zza, 0, zzc(), charset);
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    public final boolean zzh() {
        return zzmw.zzb(this.zza, 0, zzc());
    }

    @Override // com.google.android.gms.internal.measurement.zzjd
    protected final int zzi(int i, int i2, int i3) {
        return zzkl.zzh(i, this.zza, 0, i3);
    }
}
