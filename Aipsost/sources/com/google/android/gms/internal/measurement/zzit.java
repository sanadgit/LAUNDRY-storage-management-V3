package com.google.android.gms.internal.measurement;

import java.util.Arrays;
import java.util.Collection;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzit extends zzip<Boolean> implements RandomAccess, zzkk, zzlp {
    private static final zzit zza;
    private boolean[] zzb;
    private int zzc;

    static {
        zzit zzitVar = new zzit(new boolean[0], 0);
        zza = zzitVar;
        zzitVar.zzb();
    }

    zzit() {
        this(new boolean[10], 0);
    }

    private final void zzf(int i) {
        if (i < 0 || i >= this.zzc) {
            throw new IndexOutOfBoundsException(zzg(i));
        }
    }

    private final String zzg(int i) {
        int i2 = this.zzc;
        StringBuilder sb = new StringBuilder(35);
        sb.append("Index:");
        sb.append(i);
        sb.append(", Size:");
        sb.append(i2);
        return sb.toString();
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ void add(int i, Object obj) {
        int i2;
        boolean zBooleanValue = ((Boolean) obj).booleanValue();
        zzbM();
        if (i < 0 || i > (i2 = this.zzc)) {
            throw new IndexOutOfBoundsException(zzg(i));
        }
        boolean[] zArr = this.zzb;
        if (i2 < zArr.length) {
            System.arraycopy(zArr, i, zArr, i + 1, i2 - i);
        } else {
            boolean[] zArr2 = new boolean[((i2 * 3) / 2) + 1];
            System.arraycopy(zArr, 0, zArr2, 0, i);
            System.arraycopy(this.zzb, i, zArr2, i + 1, this.zzc - i);
            this.zzb = zArr2;
        }
        this.zzb[i] = zBooleanValue;
        this.zzc++;
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final boolean addAll(Collection<? extends Boolean> collection) {
        zzbM();
        zzkl.zza(collection);
        if (!(collection instanceof zzit)) {
            return super.addAll(collection);
        }
        zzit zzitVar = (zzit) collection;
        int i = zzitVar.zzc;
        if (i == 0) {
            return false;
        }
        int i2 = this.zzc;
        if (Integer.MAX_VALUE - i2 < i) {
            throw new OutOfMemoryError();
        }
        int i3 = i2 + i;
        boolean[] zArr = this.zzb;
        if (i3 > zArr.length) {
            this.zzb = Arrays.copyOf(zArr, i3);
        }
        System.arraycopy(zzitVar.zzb, 0, this.zzb, this.zzc, zzitVar.zzc);
        this.zzc = i3;
        this.modCount++;
        return true;
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final boolean contains(Object obj) {
        return indexOf(obj) != -1;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.Collection, java.util.List
    public final boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof zzit)) {
            return super.equals(obj);
        }
        zzit zzitVar = (zzit) obj;
        if (this.zzc != zzitVar.zzc) {
            return false;
        }
        boolean[] zArr = zzitVar.zzb;
        for (int i = 0; i < this.zzc; i++) {
            if (this.zzb[i] != zArr[i]) {
                return false;
            }
        }
        return true;
    }

    @Override // java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object get(int i) {
        zzf(i);
        return Boolean.valueOf(this.zzb[i]);
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.Collection, java.util.List
    public final int hashCode() {
        int iZzf = 1;
        for (int i = 0; i < this.zzc; i++) {
            iZzf = (iZzf * 31) + zzkl.zzf(this.zzb[i]);
        }
        return iZzf;
    }

    @Override // java.util.AbstractList, java.util.List
    public final int indexOf(Object obj) {
        if (!(obj instanceof Boolean)) {
            return -1;
        }
        boolean zBooleanValue = ((Boolean) obj).booleanValue();
        int i = this.zzc;
        for (int i2 = 0; i2 < i; i2++) {
            if (this.zzb[i2] == zBooleanValue) {
                return i2;
            }
        }
        return -1;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object remove(int i) {
        zzbM();
        zzf(i);
        boolean[] zArr = this.zzb;
        boolean z = zArr[i];
        if (i < this.zzc - 1) {
            System.arraycopy(zArr, i + 1, zArr, i, (r2 - i) - 1);
        }
        this.zzc--;
        this.modCount++;
        return Boolean.valueOf(z);
    }

    @Override // java.util.AbstractList
    protected final void removeRange(int i, int i2) {
        zzbM();
        if (i2 < i) {
            throw new IndexOutOfBoundsException("toIndex < fromIndex");
        }
        boolean[] zArr = this.zzb;
        System.arraycopy(zArr, i2, zArr, i, this.zzc - i2);
        this.zzc -= i2 - i;
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object set(int i, Object obj) {
        boolean zBooleanValue = ((Boolean) obj).booleanValue();
        zzbM();
        zzf(i);
        boolean[] zArr = this.zzb;
        boolean z = zArr[i];
        zArr[i] = zBooleanValue;
        return Boolean.valueOf(z);
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return this.zzc;
    }

    public final void zzd(boolean z) {
        zzbM();
        int i = this.zzc;
        boolean[] zArr = this.zzb;
        if (i == zArr.length) {
            boolean[] zArr2 = new boolean[((i * 3) / 2) + 1];
            System.arraycopy(zArr, 0, zArr2, 0, i);
            this.zzb = zArr2;
        }
        boolean[] zArr3 = this.zzb;
        int i2 = this.zzc;
        this.zzc = i2 + 1;
        zArr3[i2] = z;
    }

    @Override // com.google.android.gms.internal.measurement.zzkk
    public final /* bridge */ /* synthetic */ zzkk zze(int i) {
        if (i >= this.zzc) {
            return new zzit(Arrays.copyOf(this.zzb, i), this.zzc);
        }
        throw new IllegalArgumentException();
    }

    private zzit(boolean[] zArr, int i) {
        this.zzb = zArr;
        this.zzc = i;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final /* bridge */ /* synthetic */ boolean add(Object obj) {
        zzd(((Boolean) obj).booleanValue());
        return true;
    }
}
