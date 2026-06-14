package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzu extends zzai {
    private final zzz zza;

    public zzu(zzz zzzVar) {
        super("internal.registerCallback");
        this.zza = zzzVar;
    }

    @Override // com.google.android.gms.internal.measurement.zzai
    public final zzap zza(zzg zzgVar, List<zzap> list) {
        zzh.zza(this.zzd, 3, list);
        String strZzc = zzgVar.zza(list.get(0)).zzc();
        zzap zzapVarZza = zzgVar.zza(list.get(1));
        if (!(zzapVarZza instanceof zzao)) {
            throw new IllegalArgumentException("Invalid callback type");
        }
        zzap zzapVarZza2 = zzgVar.zza(list.get(2));
        if (!(zzapVarZza2 instanceof zzam)) {
            throw new IllegalArgumentException("Invalid callback params");
        }
        zzam zzamVar = (zzam) zzapVarZza2;
        if (!zzamVar.zzj("type")) {
            throw new IllegalArgumentException("Undefined rule type");
        }
        this.zza.zza(strZzc, zzamVar.zzj("priority") ? zzh.zzg(zzamVar.zzk("priority").zzd().doubleValue()) : 1000, (zzao) zzapVarZza, zzamVar.zzk("type").zzc());
        return zzap.zzf;
    }
}
