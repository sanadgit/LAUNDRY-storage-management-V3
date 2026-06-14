package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.measurement.api.AppMeasurementSdk;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhh implements Runnable {
    final /* synthetic */ Bundle zza;
    final /* synthetic */ zzhw zzb;

    zzhh(zzhw zzhwVar, Bundle bundle) {
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
        Preconditions.checkNotEmpty(bundle.getString(AppMeasurementSdk.ConditionalUserProperty.NAME));
        if (!zzhwVar.zzs.zzF()) {
            zzhwVar.zzs.zzau().zzk().zza("Conditional property not cleared since app measurement is disabled");
        } else {
            try {
                zzhwVar.zzs.zzy().zzm(new zzaa(bundle.getString("app_id"), bundle.getString("origin"), zzhwVar.zzs.zzc().zzn(null, zzea.zzax) ? new zzkq(bundle.getString(AppMeasurementSdk.ConditionalUserProperty.NAME), 0L, null, "") : new zzkq(bundle.getString(AppMeasurementSdk.ConditionalUserProperty.NAME), 0L, null, null), bundle.getLong(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP), bundle.getBoolean(AppMeasurementSdk.ConditionalUserProperty.ACTIVE), bundle.getString(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME), null, bundle.getLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT), null, bundle.getLong(AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE), zzhwVar.zzs.zzl().zzV(bundle.getString("app_id"), bundle.getString(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME), bundle.getBundle(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS), bundle.getString("origin"), bundle.getLong(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP), true, false)));
            } catch (IllegalArgumentException e) {
            }
        }
    }
}
