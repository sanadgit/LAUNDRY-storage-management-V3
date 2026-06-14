package com.google.android.gms.internal.measurement;

import java.lang.Comparable;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
class zzmd<K extends Comparable<K>, V> extends AbstractMap<K, V> {
    private final int zza;
    private boolean zzd;
    private volatile zzmc zze;
    private List<zzma> zzb = Collections.emptyList();
    private Map<K, V> zzc = Collections.emptyMap();
    private Map<K, V> zzf = Collections.emptyMap();

    /* JADX INFO: Access modifiers changed from: private */
    public final V zzk(int i) {
        zzm();
        V v = (V) this.zzb.remove(i).getValue();
        if (!this.zzc.isEmpty()) {
            Iterator<Map.Entry<K, V>> it = zzn().entrySet().iterator();
            List<zzma> list = this.zzb;
            Map.Entry<K, V> next = it.next();
            list.add(new zzma(this, next.getKey(), next.getValue()));
            it.remove();
        }
        return v;
    }

    private final int zzl(K k) {
        int size = this.zzb.size() - 1;
        int i = 0;
        if (size >= 0) {
            int iCompareTo = k.compareTo(this.zzb.get(size).zza());
            if (iCompareTo > 0) {
                return -(size + 2);
            }
            if (iCompareTo == 0) {
                return size;
            }
        }
        while (i <= size) {
            int i2 = (i + size) / 2;
            int iCompareTo2 = k.compareTo(this.zzb.get(i2).zza());
            if (iCompareTo2 < 0) {
                size = i2 - 1;
            } else {
                if (iCompareTo2 <= 0) {
                    return i2;
                }
                i = i2 + 1;
            }
        }
        return -(i + 1);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzm() {
        if (this.zzd) {
            throw new UnsupportedOperationException();
        }
    }

    private final SortedMap<K, V> zzn() {
        zzm();
        if (this.zzc.isEmpty() && !(this.zzc instanceof TreeMap)) {
            TreeMap treeMap = new TreeMap();
            this.zzc = treeMap;
            this.zzf = treeMap.descendingMap();
        }
        return (SortedMap) this.zzc;
    }

    @Override // java.util.AbstractMap, java.util.Map
    public final void clear() {
        zzm();
        if (!this.zzb.isEmpty()) {
            this.zzb.clear();
        }
        if (this.zzc.isEmpty()) {
            return;
        }
        this.zzc.clear();
    }

    @Override // java.util.AbstractMap, java.util.Map
    public final boolean containsKey(Object obj) {
        Comparable comparable = (Comparable) obj;
        return zzl(comparable) >= 0 || this.zzc.containsKey(comparable);
    }

    @Override // java.util.AbstractMap, java.util.Map
    public final Set<Map.Entry<K, V>> entrySet() {
        if (this.zze == null) {
            this.zze = new zzmc(this, null);
        }
        return this.zze;
    }

    @Override // java.util.AbstractMap, java.util.Map
    public final boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof zzmd)) {
            return super.equals(obj);
        }
        zzmd zzmdVar = (zzmd) obj;
        int size = size();
        if (size != zzmdVar.size()) {
            return false;
        }
        int iZzc = zzc();
        if (iZzc != zzmdVar.zzc()) {
            return entrySet().equals(zzmdVar.entrySet());
        }
        for (int i = 0; i < iZzc; i++) {
            if (!zzd(i).equals(zzmdVar.zzd(i))) {
                return false;
            }
        }
        if (iZzc != size) {
            return this.zzc.equals(zzmdVar.zzc);
        }
        return true;
    }

    @Override // java.util.AbstractMap, java.util.Map
    public final V get(Object obj) {
        Comparable comparable = (Comparable) obj;
        int iZzl = zzl(comparable);
        return iZzl >= 0 ? (V) this.zzb.get(iZzl).getValue() : this.zzc.get(comparable);
    }

    @Override // java.util.AbstractMap, java.util.Map
    public final int hashCode() {
        int iZzc = zzc();
        int iHashCode = 0;
        for (int i = 0; i < iZzc; i++) {
            iHashCode += this.zzb.get(i).hashCode();
        }
        return this.zzc.size() > 0 ? iHashCode + this.zzc.hashCode() : iHashCode;
    }

    @Override // java.util.AbstractMap, java.util.Map
    public final V remove(Object obj) {
        zzm();
        Comparable comparable = (Comparable) obj;
        int iZzl = zzl(comparable);
        if (iZzl >= 0) {
            return zzk(iZzl);
        }
        if (this.zzc.isEmpty()) {
            return null;
        }
        return this.zzc.remove(comparable);
    }

    @Override // java.util.AbstractMap, java.util.Map
    public final int size() {
        return this.zzb.size() + this.zzc.size();
    }

    public void zza() {
        if (this.zzd) {
            return;
        }
        this.zzc = this.zzc.isEmpty() ? Collections.emptyMap() : Collections.unmodifiableMap(this.zzc);
        this.zzf = this.zzf.isEmpty() ? Collections.emptyMap() : Collections.unmodifiableMap(this.zzf);
        this.zzd = true;
    }

    public final boolean zzb() {
        return this.zzd;
    }

    public final int zzc() {
        return this.zzb.size();
    }

    public final Map.Entry<K, V> zzd(int i) {
        return this.zzb.get(i);
    }

    public final Iterable<Map.Entry<K, V>> zze() {
        return this.zzc.isEmpty() ? zzlz.zza() : this.zzc.entrySet();
    }

    /* JADX WARN: Multi-variable type inference failed */
    @Override // java.util.AbstractMap, java.util.Map
    /* JADX INFO: renamed from: zzf, reason: merged with bridge method [inline-methods] */
    public final V put(K k, V v) {
        zzm();
        int iZzl = zzl(k);
        if (iZzl >= 0) {
            return (V) this.zzb.get(iZzl).setValue(v);
        }
        zzm();
        if (this.zzb.isEmpty() && !(this.zzb instanceof ArrayList)) {
            this.zzb = new ArrayList(this.zza);
        }
        int i = -(iZzl + 1);
        if (i >= this.zza) {
            return zzn().put(k, v);
        }
        int size = this.zzb.size();
        int i2 = this.zza;
        if (size == i2) {
            zzma zzmaVarRemove = this.zzb.remove(i2 - 1);
            zzn().put(zzmaVarRemove.zza(), zzmaVarRemove.getValue());
        }
        this.zzb.add(i, new zzma(this, k, v));
        return null;
    }
}
