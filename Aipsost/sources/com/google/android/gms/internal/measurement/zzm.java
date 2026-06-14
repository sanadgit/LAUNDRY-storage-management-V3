package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzm extends zzai {
    final /* synthetic */ zzo zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzm(zzn zznVar, String str, zzo zzoVar) {
        super("getValue");
        this.zza = zzoVar;
    }

    @Override // com.google.android.gms.internal.measurement.zzai
    public final zzap zza(zzg zzgVar, List<zzap> list) {
        zzh.zza("getValue", 2, list);
        zzap zzapVarZza = zzgVar.zza(list.get(0));
        zzap zzapVarZza2 = zzgVar.zza(list.get(1));
        String strZza = this.zza.zza(zzapVarZza.zzc());
        return strZza != null ? new zzat(strZza) : zzapVarZza2;
    }
}
