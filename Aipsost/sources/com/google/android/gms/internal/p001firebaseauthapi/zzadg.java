package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Arrays;
import java.util.Collection;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzadg extends zzabn implements RandomAccess, zzadk, zzaer {
    private static final zzadg zza;
    private int[] zzb;
    private int zzc;

    static {
        zzadg zzadgVar = new zzadg(new int[0], 0);
        zza = zzadgVar;
        zzadgVar.zzb();
    }

    zzadg() {
        this(new int[10], 0);
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
        int iIntValue = ((Integer) obj).intValue();
        zza();
        if (i < 0 || i > (i2 = this.zzc)) {
            throw new IndexOutOfBoundsException(zzg(i));
        }
        int[] iArr = this.zzb;
        if (i2 < iArr.length) {
            System.arraycopy(iArr, i, iArr, i + 1, i2 - i);
        } else {
            int[] iArr2 = new int[((i2 * 3) / 2) + 1];
            System.arraycopy(iArr, 0, iArr2, 0, i);
            System.arraycopy(this.zzb, i, iArr2, i + 1, this.zzc - i);
            this.zzb = iArr2;
        }
        this.zzb[i] = iIntValue;
        this.zzc++;
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final boolean addAll(Collection collection) {
        zza();
        zzadl.zze(collection);
        if (!(collection instanceof zzadg)) {
            return super.addAll(collection);
        }
        zzadg zzadgVar = (zzadg) collection;
        int i = zzadgVar.zzc;
        if (i == 0) {
            return false;
        }
        int i2 = this.zzc;
        if (Integer.MAX_VALUE - i2 < i) {
            throw new OutOfMemoryError();
        }
        int i3 = i2 + i;
        int[] iArr = this.zzb;
        if (i3 > iArr.length) {
            this.zzb = Arrays.copyOf(iArr, i3);
        }
        System.arraycopy(zzadgVar.zzb, 0, this.zzb, this.zzc, zzadgVar.zzc);
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
        if (!(obj instanceof zzadg)) {
            return super.equals(obj);
        }
        zzadg zzadgVar = (zzadg) obj;
        if (this.zzc != zzadgVar.zzc) {
            return false;
        }
        int[] iArr = zzadgVar.zzb;
        for (int i = 0; i < this.zzc; i++) {
            if (this.zzb[i] != iArr[i]) {
                return false;
            }
        }
        return true;
    }

    @Override // java.util.AbstractList, java.util.List
    public final /* synthetic */ Object get(int i) {
        zzh(i);
        return Integer.valueOf(this.zzb[i]);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.Collection, java.util.List
    public final int hashCode() {
        int i = 1;
        for (int i2 = 0; i2 < this.zzc; i2++) {
            i = (i * 31) + this.zzb[i2];
        }
        return i;
    }

    @Override // java.util.AbstractList, java.util.List
    public final int indexOf(Object obj) {
        if (!(obj instanceof Integer)) {
            return -1;
        }
        int iIntValue = ((Integer) obj).intValue();
        int i = this.zzc;
        for (int i2 = 0; i2 < i; i2++) {
            if (this.zzb[i2] == iIntValue) {
                return i2;
            }
        }
        return -1;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object remove(int i) {
        zza();
        zzh(i);
        int[] iArr = this.zzb;
        int i2 = iArr[i];
        if (i < this.zzc - 1) {
            System.arraycopy(iArr, i + 1, iArr, i, (r2 - i) - 1);
        }
        this.zzc--;
        this.modCount++;
        return Integer.valueOf(i2);
    }

    @Override // java.util.AbstractList
    protected final void removeRange(int i, int i2) {
        zza();
        if (i2 < i) {
            throw new IndexOutOfBoundsException("toIndex < fromIndex");
        }
        int[] iArr = this.zzb;
        System.arraycopy(iArr, i2, iArr, i, this.zzc - i2);
        this.zzc -= i2 - i;
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object set(int i, Object obj) {
        int iIntValue = ((Integer) obj).intValue();
        zza();
        zzh(i);
        int[] iArr = this.zzb;
        int i2 = iArr[i];
        iArr[i] = iIntValue;
        return Integer.valueOf(i2);
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return this.zzc;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadk
    public final /* bridge */ /* synthetic */ zzadk zzd(int i) {
        if (i >= this.zzc) {
            return new zzadg(Arrays.copyOf(this.zzb, i), this.zzc);
        }
        throw new IllegalArgumentException();
    }

    public final int zze(int i) {
        zzh(i);
        return this.zzb[i];
    }

    public final void zzf(int i) {
        zza();
        int i2 = this.zzc;
        int[] iArr = this.zzb;
        if (i2 == iArr.length) {
            int[] iArr2 = new int[((i2 * 3) / 2) + 1];
            System.arraycopy(iArr, 0, iArr2, 0, i2);
            this.zzb = iArr2;
        }
        int[] iArr3 = this.zzb;
        int i3 = this.zzc;
        this.zzc = i3 + 1;
        iArr3[i3] = i;
    }

    private zzadg(int[] iArr, int i) {
        this.zzb = iArr;
        this.zzc = i;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final /* bridge */ /* synthetic */ boolean add(Object obj) {
        zzf(((Integer) obj).intValue());
        return true;
    }
}
