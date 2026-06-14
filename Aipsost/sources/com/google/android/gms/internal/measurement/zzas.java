package com.google.android.gms.internal.measurement;

import java.util.Iterator;
import java.util.NoSuchElementException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzas implements Iterator<zzap> {
    final /* synthetic */ zzat zza;
    private int zzb = 0;

    zzas(zzat zzatVar) {
        this.zza = zzatVar;
    }

    @Override // java.util.Iterator
    public final boolean hasNext() {
        return this.zzb < this.zza.zza.length();
    }

    @Override // java.util.Iterator
    public final /* bridge */ /* synthetic */ zzap next() {
        if (this.zzb >= this.zza.zza.length()) {
            throw new NoSuchElementException();
        }
        String str = this.zza.zza;
        int i = this.zzb;
        this.zzb = i + 1;
        return new zzat(String.valueOf(str.charAt(i)));
    }
}
