package com.google.android.gms.internal.measurement;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkr extends zzip<String> implements RandomAccess, zzks {
    public static final zzks zza;
    private static final zzkr zzb;
    private final List<Object> zzc;

    static {
        zzkr zzkrVar = new zzkr(10);
        zzb = zzkrVar;
        zzkrVar.zzb();
        zza = zzkrVar;
    }

    public zzkr() {
        this(10);
    }

    private static String zzj(Object obj) {
        return obj instanceof String ? (String) obj : obj instanceof zzjd ? ((zzjd) obj).zzl(zzkl.zza) : zzkl.zzd((byte[]) obj);
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ void add(int i, Object obj) {
        zzbM();
        this.zzc.add(i, (String) obj);
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final boolean addAll(int i, Collection<? extends String> collection) {
        zzbM();
        if (collection instanceof zzks) {
            collection = ((zzks) collection).zzh();
        }
        boolean zAddAll = this.zzc.addAll(i, collection);
        this.modCount++;
        return zAddAll;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final void clear() {
        zzbM();
        this.zzc.clear();
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object remove(int i) {
        zzbM();
        Object objRemove = this.zzc.remove(i);
        this.modCount++;
        return zzj(objRemove);
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object set(int i, Object obj) {
        zzbM();
        return zzj(this.zzc.set(i, (String) obj));
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return this.zzc.size();
    }

    @Override // java.util.AbstractList, java.util.List
    /* JADX INFO: renamed from: zzd, reason: merged with bridge method [inline-methods] */
    public final String get(int i) {
        Object obj = this.zzc.get(i);
        if (obj instanceof String) {
            return (String) obj;
        }
        if (obj instanceof zzjd) {
            zzjd zzjdVar = (zzjd) obj;
            String strZzl = zzjdVar.zzl(zzkl.zza);
            if (zzjdVar.zzh()) {
                this.zzc.set(i, strZzl);
            }
            return strZzl;
        }
        byte[] bArr = (byte[]) obj;
        String strZzd = zzkl.zzd(bArr);
        if (zzkl.zzc(bArr)) {
            this.zzc.set(i, strZzd);
        }
        return strZzd;
    }

    @Override // com.google.android.gms.internal.measurement.zzkk
    public final /* bridge */ /* synthetic */ zzkk zze(int i) {
        if (i < size()) {
            throw new IllegalArgumentException();
        }
        ArrayList arrayList = new ArrayList(i);
        arrayList.addAll(this.zzc);
        return new zzkr((ArrayList<Object>) arrayList);
    }

    @Override // com.google.android.gms.internal.measurement.zzks
    public final void zzf(zzjd zzjdVar) {
        zzbM();
        this.zzc.add(zzjdVar);
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.measurement.zzks
    public final Object zzg(int i) {
        return this.zzc.get(i);
    }

    @Override // com.google.android.gms.internal.measurement.zzks
    public final List<?> zzh() {
        return Collections.unmodifiableList(this.zzc);
    }

    @Override // com.google.android.gms.internal.measurement.zzks
    public final zzks zzi() {
        return zza() ? new zzmm(this) : this;
    }

    public zzkr(int i) {
        this.zzc = new ArrayList(i);
    }

    private zzkr(ArrayList<Object> arrayList) {
        this.zzc = arrayList;
    }

    @Override // com.google.android.gms.internal.measurement.zzip, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final boolean addAll(Collection<? extends String> collection) {
        return addAll(size(), collection);
    }
}
