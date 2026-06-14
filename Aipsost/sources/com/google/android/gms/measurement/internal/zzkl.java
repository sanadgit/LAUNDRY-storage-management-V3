package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.text.TextUtils;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzkl implements zzkt {
    final /* synthetic */ zzkn zza;

    zzkl(zzkn zzknVar) {
        this.zza = zzknVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzkt
    public final void zza(String str, String str2, Bundle bundle) {
        if (!TextUtils.isEmpty(str)) {
            this.zza.zzav().zzh(new zzkk(this, str, "_err", bundle));
        } else if (this.zza.zzm != null) {
            this.zza.zzm.zzau().zzb().zzb("AppId not known when logging event", "_err");
        }
    }
}
