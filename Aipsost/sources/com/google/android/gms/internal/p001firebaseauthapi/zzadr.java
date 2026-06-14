package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.RandomAccess;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzadr extends zzabn implements RandomAccess, zzads {
    public static final zzads zza;
    private static final zzadr zzb;
    private final List zzc;

    static {
        zzadr zzadrVar = new zzadr(10);
        zzb = zzadrVar;
        zzadrVar.zzb();
        zza = zzadrVar;
    }

    public zzadr() {
        this(10);
    }

    private static String zzj(Object obj) {
        return obj instanceof String ? (String) obj : obj instanceof zzacc ? ((zzacc) obj).zzr(zzadl.zzb) : zzadl.zzg((byte[]) obj);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ void add(int i, Object obj) {
        zza();
        this.zzc.add(i, (String) obj);
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final boolean addAll(int i, Collection collection) {
        zza();
        if (collection instanceof zzads) {
            collection = ((zzads) collection).zzh();
        }
        boolean zAddAll = this.zzc.addAll(i, collection);
        this.modCount++;
        return zAddAll;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final void clear() {
        zza();
        this.zzc.clear();
        this.modCount++;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object remove(int i) {
        zza();
        Object objRemove = this.zzc.remove(i);
        this.modCount++;
        return zzj(objRemove);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractList, java.util.List
    public final /* bridge */ /* synthetic */ Object set(int i, Object obj) {
        zza();
        return zzj(this.zzc.set(i, (String) obj));
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return this.zzc.size();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzadk
    public final /* bridge */ /* synthetic */ zzadk zzd(int i) {
        if (i < size()) {
            throw new IllegalArgumentException();
        }
        ArrayList arrayList = new ArrayList(i);
        arrayList.addAll(this.zzc);
        return new zzadr(arrayList);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzads
    public final zzads zze() {
        return zzc() ? new zzafs(this) : this;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzads
    public final Object zzf(int i) {
        return this.zzc.get(i);
    }

    @Override // java.util.AbstractList, java.util.List
    /* JADX INFO: renamed from: zzg, reason: merged with bridge method [inline-methods] */
    public final String get(int i) {
        Object obj = this.zzc.get(i);
        if (obj instanceof String) {
            return (String) obj;
        }
        if (obj instanceof zzacc) {
            zzacc zzaccVar = (zzacc) obj;
            String strZzr = zzaccVar.zzr(zzadl.zzb);
            if (zzaccVar.zzk()) {
                this.zzc.set(i, strZzr);
            }
            return strZzr;
        }
        byte[] bArr = (byte[]) obj;
        String strZzg = zzadl.zzg(bArr);
        if (zzadl.zzh(bArr)) {
            this.zzc.set(i, strZzg);
        }
        return strZzg;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzads
    public final List zzh() {
        return Collections.unmodifiableList(this.zzc);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzads
    public final void zzi(zzacc zzaccVar) {
        zza();
        this.zzc.add(zzaccVar);
        this.modCount++;
    }

    public zzadr(int i) {
        this.zzc = new ArrayList(i);
    }

    private zzadr(ArrayList arrayList) {
        this.zzc = arrayList;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabn, java.util.AbstractCollection, java.util.Collection, java.util.List
    public final boolean addAll(Collection collection) {
        return addAll(size(), collection);
    }
}
