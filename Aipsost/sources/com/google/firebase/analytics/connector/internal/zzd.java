package com.google.firebase.analytics.connector.internal;

import android.os.Bundle;
import com.google.android.gms.measurement.api.AppMeasurementSdk;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzd implements AppMeasurementSdk.OnEventListener {
    final /* synthetic */ zze zza;

    public zzd(zze zzeVar) {
        this.zza = zzeVar;
    }

    @Override // com.google.android.gms.measurement.api.AppMeasurementSdk.OnEventListener, com.google.android.gms.measurement.internal.zzgv
    public final void onEvent(String str, String str2, Bundle bundle, long j) {
        if (this.zza.zza.contains(str2)) {
            Bundle bundle2 = new Bundle();
            bundle2.putString("events", zzc.zzk(str2));
            this.zza.zzb.onMessageTriggered(2, bundle2);
        }
    }
}
