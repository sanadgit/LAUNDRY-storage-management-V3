package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzav extends zzaw {
    public zzav() {
        this.zza.add(zzbl.BITWISE_AND);
        this.zza.add(zzbl.BITWISE_LEFT_SHIFT);
        this.zza.add(zzbl.BITWISE_NOT);
        this.zza.add(zzbl.BITWISE_OR);
        this.zza.add(zzbl.BITWISE_RIGHT_SHIFT);
        this.zza.add(zzbl.BITWISE_UNSIGNED_RIGHT_SHIFT);
        this.zza.add(zzbl.BITWISE_XOR);
    }

    @Override // com.google.android.gms.internal.measurement.zzaw
    public final zzap zza(String str, zzg zzgVar, List<zzap> list) {
        zzbl zzblVar = zzbl.ADD;
        switch (zzh.zze(str).ordinal()) {
            case 4:
                zzh.zza(zzbl.BITWISE_AND.name(), 2, list);
                return new zzah(Double.valueOf(zzh.zzg(zzgVar.zza(list.get(0)).zzd().doubleValue()) & zzh.zzg(zzgVar.zza(list.get(1)).zzd().doubleValue())));
            case 5:
                zzh.zza(zzbl.BITWISE_LEFT_SHIFT.name(), 2, list);
                return new zzah(Double.valueOf(zzh.zzg(zzgVar.zza(list.get(0)).zzd().doubleValue()) << ((int) (zzh.zzh(zzgVar.zza(list.get(1)).zzd().doubleValue()) & 31))));
            case 6:
                zzh.zza(zzbl.BITWISE_NOT.name(), 1, list);
                return new zzah(Double.valueOf(~zzh.zzg(zzgVar.zza(list.get(0)).zzd().doubleValue())));
            case 7:
                zzh.zza(zzbl.BITWISE_OR.name(), 2, list);
                return new zzah(Double.valueOf(zzh.zzg(zzgVar.zza(list.get(0)).zzd().doubleValue()) | zzh.zzg(zzgVar.zza(list.get(1)).zzd().doubleValue())));
            case 8:
                zzh.zza(zzbl.BITWISE_RIGHT_SHIFT.name(), 2, list);
                return new zzah(Double.valueOf(zzh.zzg(zzgVar.zza(list.get(0)).zzd().doubleValue()) >> ((int) (zzh.zzh(zzgVar.zza(list.get(1)).zzd().doubleValue()) & 31))));
            case 9:
                zzh.zza(zzbl.BITWISE_UNSIGNED_RIGHT_SHIFT.name(), 2, list);
                return new zzah(Double.valueOf(zzh.zzh(zzgVar.zza(list.get(0)).zzd().doubleValue()) >>> ((int) (zzh.zzh(zzgVar.zza(list.get(1)).zzd().doubleValue()) & 31))));
            case 10:
                zzh.zza(zzbl.BITWISE_XOR.name(), 2, list);
                return new zzah(Double.valueOf(zzh.zzg(zzgVar.zza(list.get(0)).zzd().doubleValue()) ^ zzh.zzg(zzgVar.zza(list.get(1)).zzd().doubleValue())));
            default:
                return super.zzb(str);
        }
    }
}
