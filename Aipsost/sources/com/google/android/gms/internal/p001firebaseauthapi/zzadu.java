package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzadu extends zzady {
    private static final Class zza = Collections.unmodifiableList(Collections.emptyList()).getClass();

    private zzadu() {
        super(null);
    }

    /* synthetic */ zzadu(zzadt zzadtVar) {
        super(null);
    }

    private static List zzf(Object obj, long j, int i) {
        List list = (List) zzafx.zzf(obj, j);
        if (list.isEmpty()) {
            List zzadrVar = list instanceof zzads ? new zzadr(i) : ((list instanceof zzaer) && (list instanceof zzadk)) ? ((zzadk) list).zzd(i) : new ArrayList(i);
            zzafx.zzs(obj, j, zzadrVar);
            return zzadrVar;
        }
        if (zza.isAssignableFrom(list.getClass())) {
            ArrayList arrayList = new ArrayList(list.size() + i);
            arrayList.addAll(list);
            zzafx.zzs(obj, j, arrayList);
            return arrayList;
        }
        if (list instanceof zzafs) {
            zzadr zzadrVar2 = new zzadr(list.size() + i);
            zzadrVar2.addAll(zzadrVar2.size(), (zzafs) list);
            zzafx.zzs(obj, j, zzadrVar2);
            return zzadrVar2;
        }
        if (!(list instanceof zzaer) || !(list instanceof zzadk)) {
            return list;
        }
        zzadk zzadkVar = (zzadk) list;
        if (zzadkVar.zzc()) {
            return list;
        }
        zzadk zzadkVarZzd = zzadkVar.zzd(list.size() + i);
        zzafx.zzs(obj, j, zzadkVarZzd);
        return zzadkVarZzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzady
    final List zza(Object obj, long j) {
        return zzf(obj, j, 10);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzady
    final void zzb(Object obj, long j) {
        Object objUnmodifiableList;
        List list = (List) zzafx.zzf(obj, j);
        if (list instanceof zzads) {
            objUnmodifiableList = ((zzads) list).zze();
        } else {
            if (zza.isAssignableFrom(list.getClass())) {
                return;
            }
            if ((list instanceof zzaer) && (list instanceof zzadk)) {
                zzadk zzadkVar = (zzadk) list;
                if (zzadkVar.zzc()) {
                    zzadkVar.zzb();
                    return;
                }
                return;
            }
            objUnmodifiableList = Collections.unmodifiableList(list);
        }
        zzafx.zzs(obj, j, objUnmodifiableList);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzady
    final void zzc(Object obj, Object obj2, long j) {
        List list = (List) zzafx.zzf(obj2, j);
        List listZzf = zzf(obj, j, list.size());
        int size = listZzf.size();
        int size2 = list.size();
        if (size > 0 && size2 > 0) {
            listZzf.addAll(list);
        }
        if (size > 0) {
            list = listZzf;
        }
        zzafx.zzs(obj, j, list);
    }
}
