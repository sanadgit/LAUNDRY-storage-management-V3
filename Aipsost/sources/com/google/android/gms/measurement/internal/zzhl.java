package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.text.TextUtils;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhl implements zzkt {
    final /* synthetic */ zzhw zza;

    zzhl(zzhw zzhwVar) {
        this.zza = zzhwVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzkt
    public final void zza(String str, String str2, Bundle bundle) {
        if (TextUtils.isEmpty(str)) {
            this.zza.zzs(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_err", bundle);
            return;
        }
        zzhw zzhwVar = this.zza;
        zzfu.zzP();
        zzhwVar.zzx(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_err", zzhwVar.zzs.zzay().currentTimeMillis(), bundle, false, true, false, str);
    }
}
