package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Iterator;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzafr implements Iterator {
    final Iterator zza;
    final /* synthetic */ zzafs zzb;

    zzafr(zzafs zzafsVar) {
        this.zzb = zzafsVar;
        this.zza = zzafsVar.zza.iterator();
    }

    @Override // java.util.Iterator
    public final boolean hasNext() {
        return this.zza.hasNext();
    }

    @Override // java.util.Iterator
    public final /* bridge */ /* synthetic */ Object next() {
        return (String) this.zza.next();
    }

    @Override // java.util.Iterator
    public final void remove() {
        throw new UnsupportedOperationException();
    }
}
