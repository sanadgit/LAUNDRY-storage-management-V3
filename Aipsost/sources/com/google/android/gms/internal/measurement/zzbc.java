package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbc extends zzaw {
    protected zzbc() {
        this.zza.add(zzbl.AND);
        this.zza.add(zzbl.NOT);
        this.zza.add(zzbl.OR);
    }

    @Override // com.google.android.gms.internal.measurement.zzaw
    public final zzap zza(String str, zzg zzgVar, List<zzap> list) {
        zzbl zzblVar = zzbl.ADD;
        switch (zzh.zze(str).ordinal()) {
            case 1:
                zzh.zza(zzbl.AND.name(), 2, list);
                zzap zzapVarZza = zzgVar.zza(list.get(0));
                return !zzapVarZza.zze().booleanValue() ? zzapVarZza : zzgVar.zza(list.get(1));
            case 47:
                zzh.zza(zzbl.NOT.name(), 1, list);
                return new zzaf(Boolean.valueOf(!zzgVar.zza(list.get(0)).zze().booleanValue()));
            case 50:
                zzh.zza(zzbl.OR.name(), 2, list);
                zzap zzapVarZza2 = zzgVar.zza(list.get(0));
                return zzapVarZza2.zze().booleanValue() ? zzapVarZza2 : zzgVar.zza(list.get(1));
            default:
                return super.zzb(str);
        }
    }
}
