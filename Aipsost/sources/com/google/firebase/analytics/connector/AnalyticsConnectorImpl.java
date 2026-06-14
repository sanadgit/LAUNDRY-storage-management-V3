package com.google.firebase.analytics.connector;

import android.content.Context;
import android.os.Bundle;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.internal.measurement.zzee;
import com.google.android.gms.measurement.AppMeasurement;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import com.google.firebase.DataCollectionDefaultChange;
import com.google.firebase.FirebaseApp;
import com.google.firebase.analytics.connector.AnalyticsConnector;
import com.google.firebase.analytics.connector.internal.zzc;
import com.google.firebase.analytics.connector.internal.zze;
import com.google.firebase.analytics.connector.internal.zzg;
import com.google.firebase.events.Event;
import com.google.firebase.events.Subscriber;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public class AnalyticsConnectorImpl implements AnalyticsConnector {
    private static volatile AnalyticsConnector zzc;
    final AppMeasurementSdk zza;
    final Map<String, com.google.firebase.analytics.connector.internal.zza> zzb;

    AnalyticsConnectorImpl(AppMeasurementSdk appMeasurementSdk) {
        Preconditions.checkNotNull(appMeasurementSdk);
        this.zza = appMeasurementSdk;
        this.zzb = new ConcurrentHashMap();
    }

    public static AnalyticsConnector getInstance() {
        return getInstance(FirebaseApp.getInstance());
    }

    static final /* synthetic */ void zza(Event event) {
        boolean z = ((DataCollectionDefaultChange) event.getPayload()).enabled;
        synchronized (AnalyticsConnectorImpl.class) {
            ((AnalyticsConnectorImpl) Preconditions.checkNotNull(zzc)).zza.zza(z);
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final boolean zzc(String str) {
        return (str.isEmpty() || !this.zzb.containsKey(str) || this.zzb.get(str) == null) ? false : true;
    }

    @Override // com.google.firebase.analytics.connector.AnalyticsConnector
    public void clearConditionalUserProperty(String userPropertyName, String clearEventName, Bundle clearEventParams) {
        if (clearEventName == null || zzc.zzb(clearEventName, clearEventParams)) {
            this.zza.clearConditionalUserProperty(userPropertyName, clearEventName, clearEventParams);
        }
    }

    @Override // com.google.firebase.analytics.connector.AnalyticsConnector
    public List<AnalyticsConnector.ConditionalUserProperty> getConditionalUserProperties(String origin, String propertyNamePrefix) {
        ArrayList arrayList = new ArrayList();
        Iterator<Bundle> it = this.zza.getConditionalUserProperties(origin, propertyNamePrefix).iterator();
        while (it.hasNext()) {
            arrayList.add(zzc.zzh(it.next()));
        }
        return arrayList;
    }

    @Override // com.google.firebase.analytics.connector.AnalyticsConnector
    public int getMaxUserProperties(String origin) {
        return this.zza.getMaxUserProperties(origin);
    }

    @Override // com.google.firebase.analytics.connector.AnalyticsConnector
    public Map<String, Object> getUserProperties(boolean includeInternal) {
        return this.zza.getUserProperties(null, null, includeInternal);
    }

    @Override // com.google.firebase.analytics.connector.AnalyticsConnector
    public void logEvent(String origin, String name, Bundle params) {
        if (params == null) {
            params = new Bundle();
        }
        if (zzc.zza(origin) && zzc.zzb(name, params) && zzc.zzf(origin, name, params)) {
            zzc.zzm(origin, name, params);
            this.zza.logEvent(origin, name, params);
        }
    }

    @Override // com.google.firebase.analytics.connector.AnalyticsConnector
    public AnalyticsConnector.AnalyticsConnectorHandle registerAnalyticsConnectorListener(final String origin, AnalyticsConnector.AnalyticsConnectorListener listener) {
        Preconditions.checkNotNull(listener);
        if (!zzc.zza(origin) || zzc(origin)) {
            return null;
        }
        AppMeasurementSdk appMeasurementSdk = this.zza;
        com.google.firebase.analytics.connector.internal.zza zzeVar = AppMeasurement.FIAM_ORIGIN.equals(origin) ? new zze(appMeasurementSdk, listener) : (AppMeasurement.CRASH_ORIGIN.equals(origin) || "clx".equals(origin)) ? new zzg(appMeasurementSdk, listener) : null;
        if (zzeVar == null) {
            return null;
        }
        this.zzb.put(origin, zzeVar);
        return new AnalyticsConnector.AnalyticsConnectorHandle() { // from class: com.google.firebase.analytics.connector.AnalyticsConnectorImpl.1
            @Override // com.google.firebase.analytics.connector.AnalyticsConnector.AnalyticsConnectorHandle
            public void registerEventNames(Set<String> set) {
                if (!AnalyticsConnectorImpl.this.zzc(origin) || !origin.equals(AppMeasurement.FIAM_ORIGIN) || set == null || set.isEmpty()) {
                    return;
                }
                AnalyticsConnectorImpl.this.zzb.get(origin).zzb(set);
            }

            @Override // com.google.firebase.analytics.connector.AnalyticsConnector.AnalyticsConnectorHandle
            public final void unregister() {
                if (AnalyticsConnectorImpl.this.zzc(origin)) {
                    AnalyticsConnector.AnalyticsConnectorListener analyticsConnectorListenerZza = AnalyticsConnectorImpl.this.zzb.get(origin).zza();
                    if (analyticsConnectorListenerZza != null) {
                        analyticsConnectorListenerZza.onMessageTriggered(0, null);
                    }
                    AnalyticsConnectorImpl.this.zzb.remove(origin);
                }
            }

            @Override // com.google.firebase.analytics.connector.AnalyticsConnector.AnalyticsConnectorHandle
            public void unregisterEventNames() {
                if (AnalyticsConnectorImpl.this.zzc(origin) && origin.equals(AppMeasurement.FIAM_ORIGIN)) {
                    AnalyticsConnectorImpl.this.zzb.get(origin).zzc();
                }
            }
        };
    }

    @Override // com.google.firebase.analytics.connector.AnalyticsConnector
    public void setConditionalUserProperty(AnalyticsConnector.ConditionalUserProperty conditionalUserProperty) {
        if (zzc.zze(conditionalUserProperty)) {
            this.zza.setConditionalUserProperty(zzc.zzg(conditionalUserProperty));
        }
    }

    @Override // com.google.firebase.analytics.connector.AnalyticsConnector
    public void setUserProperty(String origin, String name, Object value) {
        if (zzc.zza(origin) && zzc.zzd(origin, name)) {
            this.zza.setUserProperty(origin, name, value);
        }
    }

    public static AnalyticsConnector getInstance(FirebaseApp app) {
        return (AnalyticsConnector) app.get(AnalyticsConnector.class);
    }

    public static AnalyticsConnector getInstance(FirebaseApp app, Context context, Subscriber subscriber) {
        Preconditions.checkNotNull(app);
        Preconditions.checkNotNull(context);
        Preconditions.checkNotNull(subscriber);
        Preconditions.checkNotNull(context.getApplicationContext());
        if (zzc == null) {
            synchronized (AnalyticsConnectorImpl.class) {
                if (zzc == null) {
                    Bundle bundle = new Bundle(1);
                    if (app.isDefaultApp()) {
                        subscriber.subscribe(DataCollectionDefaultChange.class, zza.zza, zzb.zza);
                        bundle.putBoolean("dataCollectionDefaultEnabled", app.isDataCollectionDefaultEnabled());
                    }
                    zzc = new AnalyticsConnectorImpl(zzee.zza(context, null, null, null, bundle).zzb());
                }
            }
        }
        return zzc;
    }
}
