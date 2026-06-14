package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzadw extends zzady {
    private zzadw() {
        super(null);
    }

    /* synthetic */ zzadw(zzadv zzadvVar) {
        super(null);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzady
    final List zza(Object obj, long j) {
        zzadk zzadkVar = (zzadk) zzafx.zzf(obj, j);
        if (zzadkVar.zzc()) {
            return zzadkVar;
        }
        int size = zzadkVar.size();
        zzadk zzadkVarZzd = zzadkVar.zzd(size == 0 ? 10 : size + size);
        zzafx.zzs(obj, j, zzadkVarZzd);
        return zzadkVarZzd;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzady
    final void zzb(Object obj, long j) {
        ((zzadk) zzafx.zzf(obj, j)).zzb();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzady
    final void zzc(Object obj, Object obj2, long j) {
        zzadk zzadkVarZzd = (zzadk) zzafx.zzf(obj, j);
        zzadk zzadkVar = (zzadk) zzafx.zzf(obj2, j);
        int size = zzadkVarZzd.size();
        int size2 = zzadkVar.size();
        if (size > 0 && size2 > 0) {
            if (!zzadkVarZzd.zzc()) {
                zzadkVarZzd = zzadkVarZzd.zzd(size2 + size);
            }
            zzadkVarZzd.addAll(zzadkVar);
        }
        if (size > 0) {
            zzadkVar = zzadkVarZzd;
        }
        zzafx.zzs(obj, j, zzadkVar);
    }
}
