package com.google.android.gms.internal.measurement;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final /* synthetic */ class zzaj {
    public static zzap zza(zzal zzalVar, zzap zzapVar, zzg zzgVar, List<zzap> list) {
        if (zzalVar.zzj(zzapVar.zzc())) {
            zzap zzapVarZzk = zzalVar.zzk(zzapVar.zzc());
            if (zzapVarZzk instanceof zzai) {
                return ((zzai) zzapVarZzk).zza(zzgVar, list);
            }
            throw new IllegalArgumentException(String.format("%s is not a function", zzapVar.zzc()));
        }
        if (!"hasOwnProperty".equals(zzapVar.zzc())) {
            throw new IllegalArgumentException(String.format("Object has no function %s", zzapVar.zzc()));
        }
        zzh.zza("hasOwnProperty", 1, list);
        return zzalVar.zzj(zzgVar.zza(list.get(0)).zzc()) ? zzap.zzk : zzap.zzl;
    }

    public static Iterator<zzap> zzb(Map<String, zzap> map) {
        return new zzak(map.keySet().iterator());
    }
}
