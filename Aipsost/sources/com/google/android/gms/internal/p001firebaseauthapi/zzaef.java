package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Iterator;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaef {
    zzaef() {
    }

    public static final int zza(int i, Object obj, Object obj2) {
        zzaee zzaeeVar = (zzaee) obj;
        if (zzaeeVar.isEmpty()) {
            return 0;
        }
        Iterator it = zzaeeVar.entrySet().iterator();
        if (!it.hasNext()) {
            return 0;
        }
        Map.Entry entry = (Map.Entry) it.next();
        entry.getKey();
        entry.getValue();
        throw null;
    }

    public static final boolean zzb(Object obj) {
        return !((zzaee) obj).zze();
    }

    public static final Object zzc(Object obj, Object obj2) {
        zzaee zzaeeVarZzb = (zzaee) obj;
        zzaee zzaeeVar = (zzaee) obj2;
        if (!zzaeeVar.isEmpty()) {
            if (!zzaeeVarZzb.zze()) {
                zzaeeVarZzb = zzaeeVarZzb.zzb();
            }
            zzaeeVarZzb.zzd(zzaeeVar);
        }
        return zzaeeVarZzb;
    }
}
