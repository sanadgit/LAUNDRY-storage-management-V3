package com.google.android.gms.internal.measurement;

import java.util.NoSuchElementException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zziv extends zzix {
    final /* synthetic */ zzjd zza;
    private int zzb = 0;
    private final int zzc;

    zziv(zzjd zzjdVar) {
        this.zza = zzjdVar;
        this.zzc = zzjdVar.zzc();
    }

    @Override // java.util.Iterator
    public final boolean hasNext() {
        return this.zzb < this.zzc;
    }

    @Override // com.google.android.gms.internal.measurement.zziz
    public final byte zza() {
        int i = this.zzb;
        if (i >= this.zzc) {
            throw new NoSuchElementException();
        }
        this.zzb = i + 1;
        return this.zza.zzb(i);
    }
}
