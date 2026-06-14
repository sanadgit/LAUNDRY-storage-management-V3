package com.google.android.gms.internal.measurement;

import java.util.Iterator;
import java.util.NoSuchElementException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzad implements Iterator<zzap> {
    final /* synthetic */ zzae zza;
    private int zzb = 0;

    zzad(zzae zzaeVar) {
        this.zza = zzaeVar;
    }

    @Override // java.util.Iterator
    public final boolean hasNext() {
        return this.zzb < this.zza.zzh();
    }

    @Override // java.util.Iterator
    public final /* bridge */ /* synthetic */ zzap next() {
        if (this.zzb < this.zza.zzh()) {
            zzae zzaeVar = this.zza;
            int i = this.zzb;
            this.zzb = i + 1;
            return zzaeVar.zzl(i);
        }
        int i2 = this.zzb;
        StringBuilder sb = new StringBuilder(32);
        sb.append("Out of bounds index: ");
        sb.append(i2);
        throw new NoSuchElementException(sb.toString());
    }
}
