package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbj extends zzaw {
    @Override // com.google.android.gms.internal.measurement.zzaw
    public final zzap zza(String str, zzg zzgVar, List<zzap> list) {
        if (str == null || str.isEmpty() || !zzgVar.zzd(str)) {
            throw new IllegalArgumentException(String.format("Command not found: %s", str));
        }
        zzap zzapVarZzh = zzgVar.zzh(str);
        if (zzapVarZzh instanceof zzai) {
            return ((zzai) zzapVarZzh).zza(zzgVar, list);
        }
        throw new IllegalArgumentException(String.format("Function %s is not defined", str));
    }
}
