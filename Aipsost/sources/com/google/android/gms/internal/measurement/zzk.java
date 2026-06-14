package com.google.android.gms.internal.measurement;

import java.util.HashMap;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzk extends zzai {
    private final zzab zza;

    public zzk(zzab zzabVar) {
        super("internal.eventLogger");
        this.zza = zzabVar;
    }

    @Override // com.google.android.gms.internal.measurement.zzai
    public final zzap zza(zzg zzgVar, List<zzap> list) {
        zzh.zza(this.zzd, 3, list);
        String strZzc = zzgVar.zza(list.get(0)).zzc();
        long jZzi = (long) zzh.zzi(zzgVar.zza(list.get(1)).zzd().doubleValue());
        zzap zzapVarZza = zzgVar.zza(list.get(2));
        HashMap map = new HashMap();
        if (zzapVarZza instanceof zzam) {
            zzam zzamVar = (zzam) zzapVarZza;
            for (String str : zzamVar.zzb()) {
                Object objZzj = zzh.zzj(zzamVar.zzk(str));
                if (objZzj != null) {
                    map.put(str, objZzj);
                }
            }
        }
        this.zza.zze(strZzc, jZzi, map);
        return zzap.zzf;
    }
}
