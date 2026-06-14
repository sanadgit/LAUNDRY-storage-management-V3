package com.google.android.gms.internal.measurement;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzku extends zzkw {
    private static final Class<?> zza = Collections.unmodifiableList(Collections.emptyList()).getClass();

    private zzku() {
        super(null);
    }

    /* synthetic */ zzku(zzkt zzktVar) {
        super(null);
    }

    @Override // com.google.android.gms.internal.measurement.zzkw
    final void zza(Object obj, long j) {
        Object objUnmodifiableList;
        List list = (List) zzmr.zzn(obj, j);
        if (list instanceof zzks) {
            objUnmodifiableList = ((zzks) list).zzi();
        } else {
            if (zza.isAssignableFrom(list.getClass())) {
                return;
            }
            if ((list instanceof zzlp) && (list instanceof zzkk)) {
                zzkk zzkkVar = (zzkk) list;
                if (zzkkVar.zza()) {
                    zzkkVar.zzb();
                    return;
                }
                return;
            }
            objUnmodifiableList = Collections.unmodifiableList(list);
        }
        zzmr.zzo(obj, j, objUnmodifiableList);
    }

    @Override // com.google.android.gms.internal.measurement.zzkw
    final <E> void zzb(Object obj, Object obj2, long j) {
        List list;
        List list2 = (List) zzmr.zzn(obj2, j);
        int size = list2.size();
        List list3 = (List) zzmr.zzn(obj, j);
        if (list3.isEmpty()) {
            List zzkrVar = list3 instanceof zzks ? new zzkr(size) : ((list3 instanceof zzlp) && (list3 instanceof zzkk)) ? ((zzkk) list3).zze(size) : new ArrayList(size);
            zzmr.zzo(obj, j, zzkrVar);
            list = zzkrVar;
        } else if (zza.isAssignableFrom(list3.getClass())) {
            ArrayList arrayList = new ArrayList(list3.size() + size);
            arrayList.addAll(list3);
            zzmr.zzo(obj, j, arrayList);
            list = arrayList;
        } else if (list3 instanceof zzmm) {
            zzkr zzkrVar2 = new zzkr(list3.size() + size);
            zzkrVar2.addAll(zzkrVar2.size(), (zzmm) list3);
            zzmr.zzo(obj, j, zzkrVar2);
            list = zzkrVar2;
        } else {
            boolean z = list3 instanceof zzlp;
            list = list3;
            if (z) {
                boolean z2 = list3 instanceof zzkk;
                list = list3;
                if (z2) {
                    zzkk zzkkVar = (zzkk) list3;
                    list = list3;
                    if (!zzkkVar.zza()) {
                        zzkk<E> zzkkVarZze = zzkkVar.zze(list3.size() + size);
                        zzmr.zzo(obj, j, zzkkVarZze);
                        list = zzkkVarZze;
                    }
                }
            }
        }
        int size2 = list.size();
        int size3 = list2.size();
        if (size2 > 0 && size3 > 0) {
            list.addAll(list2);
        }
        if (size2 > 0) {
            list2 = list;
        }
        zzmr.zzo(obj, j, list2);
    }
}
