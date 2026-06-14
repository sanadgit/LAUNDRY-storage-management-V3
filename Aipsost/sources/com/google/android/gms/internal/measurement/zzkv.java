package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzkv extends zzkw {
    private zzkv() {
        super(null);
    }

    /* synthetic */ zzkv(zzkt zzktVar) {
        super(null);
    }

    @Override // com.google.android.gms.internal.measurement.zzkw
    final void zza(Object obj, long j) {
        ((zzkk) zzmr.zzn(obj, j)).zzb();
    }

    /* JADX WARN: Multi-variable type inference failed */
    /* JADX WARN: Type inference failed for: r0v2 */
    /* JADX WARN: Type inference failed for: r0v3, types: [com.google.android.gms.internal.measurement.zzkk] */
    /* JADX WARN: Type inference failed for: r0v5 */
    /* JADX WARN: Type inference failed for: r0v6 */
    /* JADX WARN: Type inference failed for: r0v7 */
    /* JADX WARN: Type inference failed for: r0v8 */
    /* JADX WARN: Type inference failed for: r0v9 */
    /* JADX WARN: Type inference failed for: r6v2, types: [com.google.android.gms.internal.measurement.zzkk, java.util.Collection] */
    /* JADX WARN: Type inference failed for: r6v3, types: [java.lang.Object] */
    /* JADX WARN: Type inference failed for: r6v4 */
    @Override // com.google.android.gms.internal.measurement.zzkw
    final <E> void zzb(Object obj, Object obj2, long j) {
        zzkk zzkkVar = (zzkk) zzmr.zzn(obj, j);
        ?? r6 = (zzkk) zzmr.zzn(obj2, j);
        int size = zzkkVar.size();
        int size2 = r6.size();
        ?? r0 = zzkkVar;
        r0 = zzkkVar;
        if (size > 0 && size2 > 0) {
            boolean zZza = zzkkVar.zza();
            ?? Zze = zzkkVar;
            if (!zZza) {
                Zze = zzkkVar.zze(size2 + size);
            }
            Zze.addAll(r6);
            r0 = Zze;
        }
        if (size > 0) {
            r6 = r0;
        }
        zzmr.zzo(obj, j, r6);
    }
}
