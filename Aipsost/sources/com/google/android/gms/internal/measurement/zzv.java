package com.google.android.gms.internal.measurement;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzv extends zzai {
    final Map<String, zzai> zza;
    private final zzj zzb;

    public zzv(zzj zzjVar) {
        super("require");
        this.zza = new HashMap();
        this.zzb = zzjVar;
    }

    @Override // com.google.android.gms.internal.measurement.zzai
    public final zzap zza(zzg zzgVar, List<zzap> list) {
        zzai zzaiVarCall;
        zzh.zza("require", 1, list);
        String strZzc = zzgVar.zza(list.get(0)).zzc();
        if (this.zza.containsKey(strZzc)) {
            return this.zza.get(strZzc);
        }
        zzj zzjVar = this.zzb;
        if (zzjVar.zza.containsKey(strZzc)) {
            try {
                zzaiVarCall = zzjVar.zza.get(strZzc).call();
            } catch (Exception e) {
                String strValueOf = String.valueOf(strZzc);
                throw new IllegalStateException(strValueOf.length() != 0 ? "Failed to create API implementation: ".concat(strValueOf) : new String("Failed to create API implementation: "));
            }
        } else {
            zzaiVarCall = zzap.zzf;
        }
        if (zzaiVarCall instanceof zzai) {
            this.zza.put(strZzc, (zzai) zzaiVarCall);
        }
        return zzaiVarCall;
    }
}
