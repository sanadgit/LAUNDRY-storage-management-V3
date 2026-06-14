package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.measurement.api.AppMeasurementSdk;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhg implements Runnable {
    final /* synthetic */ Bundle zza;
    final /* synthetic */ zzhw zzb;

    zzhg(zzhw zzhwVar, Bundle bundle) {
        this.zzb = zzhwVar;
        this.zza = bundle;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzhw zzhwVar = this.zzb;
        Bundle bundle = this.zza;
        zzhwVar.zzg();
        zzhwVar.zzb();
        Preconditions.checkNotNull(bundle);
        String string = bundle.getString(AppMeasurementSdk.ConditionalUserProperty.NAME);
        String string2 = bundle.getString("origin");
        Preconditions.checkNotEmpty(string);
        Preconditions.checkNotEmpty(string2);
        Preconditions.checkNotNull(bundle.get("value"));
        if (!zzhwVar.zzs.zzF()) {
            zzhwVar.zzs.zzau().zzk().zza("Conditional property not set since app measurement is disabled");
            return;
        }
        zzkq zzkqVar = new zzkq(string, bundle.getLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_TIMESTAMP), bundle.get("value"), string2);
        try {
            zzas zzasVarZzV = zzhwVar.zzs.zzl().zzV(bundle.getString("app_id"), bundle.getString(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_NAME), bundle.getBundle(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_PARAMS), string2, 0L, true, false);
            zzhwVar.zzs.zzy().zzm(new zzaa(bundle.getString("app_id"), string2, zzkqVar, bundle.getLong(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP), false, bundle.getString(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME), zzhwVar.zzs.zzl().zzV(bundle.getString("app_id"), bundle.getString(AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_NAME), bundle.getBundle(AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_PARAMS), string2, 0L, true, false), bundle.getLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT), zzasVarZzV, bundle.getLong(AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE), zzhwVar.zzs.zzl().zzV(bundle.getString("app_id"), bundle.getString(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME), bundle.getBundle(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS), string2, 0L, true, false)));
        } catch (IllegalArgumentException e) {
        }
    }
}
