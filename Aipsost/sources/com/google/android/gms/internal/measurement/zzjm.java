package com.google.android.gms.internal.measurement;

import java.util.Arrays;
import java.util.Collection;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjm extends zzip<Double> implements RandomAccess, zzkk, zzlp {
    private static final zzjm zza;
    private double[] zzb;
    private int zzc;

    static {
        zzjm zzjmVar = new zzjm(new double[0], 0);
        zza = zzjmVar;
        zzjmVar.zzb();
    }

    zzjm() {
        this(new double[10], 0);
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
        double dDoubleValue = ((Double) obj).doubleValue();
        zzbM();
        if (i < 0 || i > (i2 = this.zzc)) {
            throw new IndexOutOfBoundsException(zzg(i));
        }
        double[] dArr = this.zzb;
        if (i2 < dArr.length) {
            System.arraycopy(dArr, i, dArr, i + 1, i2 - i);
        } else {
            double[] dArr2 = new double[((i2 * 3) / 2) + 1];
            System.arraycopy(dArr, 0, dArr2, 0, i);
            System.arraycopy(this.zzb, i, dArr2, i + 1, this.zzc - i);
            this.zzb = dArr2;
        }
        this.zzb[i] = dDoubleValue;
        this.zzc++;
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final boolean addAll(Collection<? extends Double> collection) {
        zzbM();
        zzkl.zza(collection);
        if (!(collection instanceof zzjm)) {
            return super.addAll(collection);
        }
        zzjm zzjmVar = (zzjm) collection;
        int i = zzjmVar.zzc;
        if (i == 0) {
            return false;
        }
        int i2 = this.zzc;
        if (Integer.MAX_VALUE - i2 < i) {
            throw new OutOfMemoryError();
        }
        int i3 = i2 + i;
        double[] dArr = this.zzb;
        if (i3 > dArr.length) {
            this.zzb = Arrays.copyOf(dArr, i3);
        }
        System.arraycopy(zzjmVar.zzb, 0, this.zzb, this.zzc, zzjmVar.zzc);
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
        if (!(obj instanceof zzjm)) {
            return super.equals(obj);
        }
        zzjm zzjmVar = (zzjm) obj;
        if (this.zzc != zzjmVar.zzc) {
            return false;
        }
        double[] dArr = zzjmVar.zzb;
        for (int i = 0; i < this.zzc; i++) {
            if (Double.doubleToLongBits(this.zzb[i]) != Double.doubleToLongBits(dArr[i])) {
                return false;
            }
        }
        return true;
    }

    @Override // java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object get(int i) {
        zzf(i);
        return Double.valueOf(this.zzb[i]);
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.Collection, java.util.List
    public final int hashCode() {
        int iZze = 1;
        for (int i = 0; i < this.zzc; i++) {
            iZze = (iZze * 31) + zzkl.zze(Double.doubleToLongBits(this.zzb[i]));
        }
        return iZze;
    }

    @Override // java.util.AbstractList, java.util.List
    public final int indexOf(Object obj) {
        if (!(obj instanceof Double)) {
            return -1;
        }
        double dDoubleValue = ((Double) obj).doubleValue();
        int i = this.zzc;
        for (int i2 = 0; i2 < i; i2++) {
            if (this.zzb[i2] == dDoubleValue) {
                return i2;
            }
        }
        return -1;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object remove(int i) {
        zzbM();
        zzf(i);
        double[] dArr = this.zzb;
        double d = dArr[i];
        if (i < this.zzc - 1) {
            System.arraycopy(dArr, i + 1, dArr, i, (r3 - i) - 1);
        }
        this.zzc--;
        this.modCount++;
        return Double.valueOf(d);
    }

    @Override // java.util.AbstractList
    protected final void removeRange(int i, int i2) {
        zzbM();
        if (i2 < i) {
            throw new IndexOutOfBoundsException("toIndex < fromIndex");
        }
        double[] dArr = this.zzb;
        System.arraycopy(dArr, i2, dArr, i, this.zzc - i2);
        this.zzc -= i2 - i;
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object set(int i, Object obj) {
        double dDoubleValue = ((Double) obj).doubleValue();
        zzbM();
        zzf(i);
        double[] dArr = this.zzb;
        double d = dArr[i];
        dArr[i] = dDoubleValue;
        return Double.valueOf(d);
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return this.zzc;
    }

    public final void zzd(double d) {
        zzbM();
        int i = this.zzc;
        double[] dArr = this.zzb;
        if (i == dArr.length) {
            double[] dArr2 = new double[((i * 3) / 2) + 1];
            System.arraycopy(dArr, 0, dArr2, 0, i);
            this.zzb = dArr2;
        }
        double[] dArr3 = this.zzb;
        int i2 = this.zzc;
        this.zzc = i2 + 1;
        dArr3[i2] = d;
    }

    @Override // com.google.android.gms.internal.measurement.zzkk
    public final /* bridge */ /* synthetic */ zzkk zze(int i) {
        if (i >= this.zzc) {
            return new zzjm(Arrays.copyOf(this.zzb, i), this.zzc);
        }
        throw new IllegalArgumentException();
    }

    private zzjm(double[] dArr, int i) {
        this.zzb = dArr;
        this.zzc = i;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final /* bridge */ /* synthetic */ boolean add(Object obj) {
        zzd(((Double) obj).doubleValue());
        return true;
    }
}
