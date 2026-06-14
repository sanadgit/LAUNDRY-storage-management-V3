package com.google.android.gms.internal.measurement;

import java.util.Iterator;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzmb implements Iterator<Map.Entry> {
    final /* synthetic */ zzmd zza;
    private int zzb = -1;
    private boolean zzc;
    private Iterator<Map.Entry> zzd;

    /* synthetic */ zzmb(zzmd zzmdVar, zzlw zzlwVar) {
        this.zza = zzmdVar;
    }

    private final Iterator<Map.Entry> zza() {
        if (this.zzd == null) {
            this.zzd = this.zza.zzc.entrySet().iterator();
        }
        return this.zzd;
    }

    @Override // java.util.Iterator
    public final boolean hasNext() {
        if (this.zzb + 1 >= this.zza.zzb.size()) {
            return !this.zza.zzc.isEmpty() && zza().hasNext();
        }
        return true;
    }

    @Override // java.util.Iterator
    public final /* bridge */ /* synthetic */ Map.Entry next() {
        this.zzc = true;
        int i = this.zzb + 1;
        this.zzb = i;
        return i < this.zza.zzb.size() ? (Map.Entry) this.zza.zzb.get(this.zzb) : zza().next();
    }

    @Override // java.util.Iterator
    public final void remove() {
        if (!this.zzc) {
            throw new IllegalStateException("remove() was called before next()");
        }
        this.zzc = false;
        this.zza.zzm();
        if (this.zzb >= this.zza.zzb.size()) {
            zza().remove();
            return;
        }
        zzmd zzmdVar = this.zza;
        int i = this.zzb;
        this.zzb = i - 1;
        zzmdVar.zzk(i);
    }
}
