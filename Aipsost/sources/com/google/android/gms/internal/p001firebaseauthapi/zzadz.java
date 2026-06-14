package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Arrays;
import java.util.Collection;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzadz extends zzabn implements RandomAccess, zzadk, zzaer {
    private static final zzadz zza;
    private long[] zzb;
    private int zzc;

    static {
        zzadz zzadzVar = new zzadz(new long[0], 0);
        zza = zzadzVar;
        zzadzVar.zzb();
    }

    zzadz() {
        this(new long[10], 0);
    }

    private final String zzg(int i) {
        return "Index:" + i + ", Size:" + this.zzc;
    }

    private final void zzh(int i) {
        if (i < 0 || i >= this.zzc) {
            throw new IndexOutOfBoundsException(zzg(i));
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final /* synthetic */ void add(int i, Object obj) {
        int i2;
        long jLongValue = ((Long) obj).longValue();
        zza();
        if (i < 0 || i > (i2 = this.zzc)) {
            throw new IndexOutOfBoundsException(zzg(i));
        }
        long[] jArr = this.zzb;
        if (i2 < jArr.length) {
            System.arraycopy(jArr, i, jArr, i + 1, i2 - i);
        } else {
            long[] jArr2 = new long[((i2 * 3) / 2) + 1];
            System.arraycopy(jArr, 0, jArr2, 0, i);
            System.arraycopy(this.zzb, i, jArr2, i + 1, this.zzc - i);
            this.zzb = jArr2;
        }
        this.zzb[i] = jLongValue;
        this.zzc++;
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final boolean addAll(Collection collection) {
        zza();
        zzadl.zze(collection);
        if (!(collection instanceof zzadz)) {
            return super.addAll(collection);
        }
        zzadz zzadzVar = (zzadz) collection;
        int i = zzadzVar.zzc;
        if (i == 0) {
            return false;
        }
        int i2 = this.zzc;
        if (Integer.MAX_VALUE - i2 < i) {
            throw new OutOfMemoryError();
        }
        int i3 = i2 + i;
        long[] jArr = this.zzb;
        if (i3 > jArr.length) {
            this.zzb = Arrays.copyOf(jArr, i3);
        }
        System.arraycopy(zzadzVar.zzb, 0, this.zzb, this.zzc, zzadzVar.zzc);
        this.zzc = i3;
        this.modCount++;
        return true;
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final boolean contains(Object obj) {
        return indexOf(obj) != -1;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.Collection, java.util.List
    public final boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof zzadz)) {
            return super.equals(obj);
        }
        zzadz zzadzVar = (zzadz) obj;
        if (this.zzc != zzadzVar.zzc) {
            return false;
        }
        long[] jArr = zzadzVar.zzb;
        for (int i = 0; i < this.zzc; i++) {
            if (this.zzb[i] != jArr[i]) {
                return false;
            }
        }
        return true;
    }

    @Override // java.util.AbstractList, java.util.List
    public final /* synthetic */ Object get(int i) {
        zzh(i);
        return Long.valueOf(this.zzb[i]);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.Collection, java.util.List
    public final int hashCode() {
        int iZzc = 1;
        for (int i = 0; i < this.zzc; i++) {
            iZzc = (iZzc * 31) + zzadl.zzc(this.zzb[i]);
        }
        return iZzc;
    }

    @Override // java.util.AbstractList, java.util.List
    public final int indexOf(Object obj) {
        if (!(obj instanceof Long)) {
            return -1;
        }
        long jLongValue = ((Long) obj).longValue();
        int i = this.zzc;
        for (int i2 = 0; i2 < i; i2++) {
            if (this.zzb[i2] == jLongValue) {
                return i2;
            }
        }
        return -1;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object remove(int i) {
        zza();
        zzh(i);
        long[] jArr = this.zzb;
        long j = jArr[i];
        if (i < this.zzc - 1) {
            System.arraycopy(jArr, i + 1, jArr, i, (r3 - i) - 1);
        }
        this.zzc--;
        this.modCount++;
        return Long.valueOf(j);
    }

    @Override // java.util.AbstractList
    protected final void removeRange(int i, int i2) {
        zza();
        if (i2 < i) {
            throw new IndexOutOfBoundsException("toIndex < fromIndex");
        }
        long[] jArr = this.zzb;
        System.arraycopy(jArr, i2, jArr, i, this.zzc - i2);
        this.zzc -= i2 - i;
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object set(int i, Object obj) {
        long jLongValue = ((Long) obj).longValue();
        zza();
        zzh(i);
        long[] jArr = this.zzb;
        long j = jArr[i];
        jArr[i] = jLongValue;
        return Long.valueOf(j);
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return this.zzc;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadk
    public final /* bridge */ /* synthetic */ zzadk zzd(int i) {
        if (i >= this.zzc) {
            return new zzadz(Arrays.copyOf(this.zzb, i), this.zzc);
        }
        throw new IllegalArgumentException();
    }

    public final long zze(int i) {
        zzh(i);
        return this.zzb[i];
    }

    public final void zzf(long j) {
        zza();
        int i = this.zzc;
        long[] jArr = this.zzb;
        if (i == jArr.length) {
            long[] jArr2 = new long[((i * 3) / 2) + 1];
            System.arraycopy(jArr, 0, jArr2, 0, i);
            this.zzb = jArr2;
        }
        long[] jArr3 = this.zzb;
        int i2 = this.zzc;
        this.zzc = i2 + 1;
        jArr3[i2] = j;
    }

    private zzadz(long[] jArr, int i) {
        this.zzb = jArr;
        this.zzc = i;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final /* bridge */ /* synthetic */ boolean add(Object obj) {
        zzf(((Long) obj).longValue());
        return true;
    }
}
