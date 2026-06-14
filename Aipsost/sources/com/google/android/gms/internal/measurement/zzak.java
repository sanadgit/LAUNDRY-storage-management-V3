package com.google.android.gms.internal.measurement;

import java.util.Iterator;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzak implements Iterator<zzap> {
    final /* synthetic */ Iterator zza;

    zzak(Iterator it) {
        this.zza = it;
    }

    @Override // java.util.Iterator
    public final boolean hasNext() {
        return this.zza.hasNext();
    }

    @Override // java.util.Iterator
    public final /* bridge */ /* synthetic */ zzap next() {
        return new zzat((String) this.zza.next());
    }
}
