package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzy extends zzai {
    public zzy() {
        super("internal.platform");
        this.zze.put("isAndroid", new zzw(this, "isAndroid"));
        this.zze.put("getVersion", new zzx(this, "getVersion"));
    }

    @Override // com.google.android.gms.internal.measurement.zzai
    public final zzap zza(zzg zzgVar, List<zzap> list) {
        return zzf;
    }
}
