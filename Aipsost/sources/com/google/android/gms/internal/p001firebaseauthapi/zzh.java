package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Iterator;
import java.util.NoSuchElementException;
import javax.annotation.CheckForNull;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzh implements Iterator {

    @CheckForNull
    private Object zza;
    private int zzb = 2;

    protected zzh() {
    }

    @Override // java.util.Iterator
    public final Object next() {
        if (!hasNext()) {
            throw new NoSuchElementException();
        }
        this.zzb = 2;
        Object obj = this.zza;
        this.zza = null;
        return obj;
    }

    @Override // java.util.Iterator
    public final void remove() {
        throw new UnsupportedOperationException();
    }

    @CheckForNull
    protected abstract Object zza();

    @CheckForNull
    protected final Object zzb() {
        this.zzb = 3;
        return null;
    }

    @Override // java.util.Iterator
    public final boolean hasNext() {
        int i = this.zzb;
        if (i == 4) {
            throw new IllegalStateException();
        }
        int i2 = i - 1;
        if (i == 0) {
            throw null;
        }
        switch (i2) {
            case 0:
                return true;
            case 1:
            default:
                this.zzb = 4;
                this.zza = zza();
                if (this.zzb == 3) {
                    return false;
                }
                this.zzb = 1;
                return true;
            case 2:
                return false;
        }
    }
}
