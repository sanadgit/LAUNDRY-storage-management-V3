package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzn extends zzai {
    private final zzo zza;

    public zzn(String str, zzo zzoVar) {
        super("internal.remoteConfig");
        this.zza = zzoVar;
        this.zze.put("getValue", new zzm(this, "getValue", zzoVar));
    }

    @Override // com.google.android.gms.internal.measurement.zzai
    public final zzap zza(zzg zzgVar, List<zzap> list) {
        return zzf;
    }
}
