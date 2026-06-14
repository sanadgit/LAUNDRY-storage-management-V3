package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Iterator;
import java.util.NoSuchElementException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzafa implements Iterator {
    zzafa() {
    }

    @Override // java.util.Iterator
    public final boolean hasNext() {
        return false;
    }

    @Override // java.util.Iterator
    public final Object next() {
        throw new NoSuchElementException();
    }

    @Override // java.util.Iterator
    public final void remove() {
        throw new UnsupportedOperationException();
    }
}
