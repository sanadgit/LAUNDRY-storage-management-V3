package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Comparator;
import kotlin.UByte;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzabu implements Comparator {
    zzabu() {
    }

    @Override // java.util.Comparator
    public final /* synthetic */ int compare(Object obj, Object obj2) {
        zzacc zzaccVar = (zzacc) obj;
        zzacc zzaccVar2 = (zzacc) obj2;
        zzabt zzabtVar = new zzabt(zzaccVar);
        zzabt zzabtVar2 = new zzabt(zzaccVar2);
        while (zzabtVar.hasNext() && zzabtVar2.hasNext()) {
            int iCompareTo = Integer.valueOf(zzabtVar.zza() & UByte.MAX_VALUE).compareTo(Integer.valueOf(zzabtVar2.zza() & UByte.MAX_VALUE));
            if (iCompareTo != 0) {
                return iCompareTo;
            }
        }
        return Integer.valueOf(zzaccVar.zzd()).compareTo(Integer.valueOf(zzaccVar2.zzd()));
    }
}
