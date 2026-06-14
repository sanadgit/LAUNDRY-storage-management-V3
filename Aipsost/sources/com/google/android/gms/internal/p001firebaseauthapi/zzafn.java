package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzafn {
    zzafn() {
    }

    abstract int zza(Object obj);

    abstract int zzb(Object obj);

    abstract Object zzc(Object obj);

    abstract Object zzd(Object obj);

    abstract Object zze(Object obj, Object obj2);

    abstract Object zzf();

    abstract Object zzg(Object obj);

    abstract void zzh(Object obj, int i, int i2);

    abstract void zzi(Object obj, int i, long j);

    abstract void zzj(Object obj, int i, Object obj2);

    abstract void zzk(Object obj, int i, zzacc zzaccVar);

    abstract void zzl(Object obj, int i, long j);

    abstract void zzm(Object obj);

    abstract void zzn(Object obj, Object obj2);

    abstract void zzo(Object obj, Object obj2);

    abstract boolean zzq(zzaev zzaevVar);

    abstract void zzr(Object obj, zzaco zzacoVar) throws IOException;

    final boolean zzp(Object obj, zzaev zzaevVar) throws IOException {
        int iZzd = zzaevVar.zzd();
        int i = iZzd >>> 3;
        switch (iZzd & 7) {
            case 0:
                zzl(obj, i, zzaevVar.zzl());
                return true;
            case 1:
                zzi(obj, i, zzaevVar.zzk());
                return true;
            case 2:
                zzk(obj, i, zzaevVar.zzp());
                return true;
            case 3:
                Object objZzf = zzf();
                int i2 = (i << 3) | 4;
                while (zzaevVar.zzc() != Integer.MAX_VALUE && zzp(objZzf, zzaevVar)) {
                }
                if (i2 != zzaevVar.zzd()) {
                    throw zzadn.zzb();
                }
                zzg(objZzf);
                zzj(obj, i, objZzf);
                return true;
            case 4:
                return false;
            case 5:
                zzh(obj, i, zzaevVar.zzf());
                return true;
            default:
                throw zzadn.zza();
        }
    }
}
