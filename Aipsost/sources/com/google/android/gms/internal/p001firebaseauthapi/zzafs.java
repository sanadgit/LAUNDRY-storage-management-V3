package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.AbstractList;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzafs extends AbstractList implements RandomAccess, zzads {
    private final zzads zza;

    public zzafs(zzads zzadsVar) {
        this.zza = zzadsVar;
    }

    @Override // java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object get(int i) {
        return ((zzadr) this.zza).get(i);
    }

    @Override // java.util.AbstractList, java.util.AbstractCollection, java.util.Collection, java.lang.Iterable, java.util.List
    public final Iterator iterator() {
        return new zzafr(this);
    }

    @Override // java.util.AbstractList, java.util.List
    public final ListIterator listIterator(int i) {
        return new zzafq(this, i);
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return this.zza.size();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzads
    public final zzads zze() {
        return this;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzads
    public final Object zzf(int i) {
        return this.zza.zzf(i);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzads
    public final List zzh() {
        return this.zza.zzh();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzads
    public final void zzi(zzacc zzaccVar) {
        throw new UnsupportedOperationException();
    }
}
