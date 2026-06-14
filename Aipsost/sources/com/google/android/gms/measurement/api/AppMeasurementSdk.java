package com.google.android.gms.measurement.api;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import com.google.android.gms.internal.measurement.zzee;
import com.google.android.gms.measurement.internal.zzgu;
import com.google.android.gms.measurement.internal.zzgv;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public class AppMeasurementSdk {
    private final zzee zza;

    /* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
    public static final class ConditionalUserProperty {
        public static final String ACTIVE = "active";
        public static final String CREATION_TIMESTAMP = "creation_timestamp";
        public static final String EXPIRED_EVENT_NAME = "expired_event_name";
        public static final String EXPIRED_EVENT_PARAMS = "expired_event_params";
        public static final String NAME = "name";
        public static final String ORIGIN = "origin";
        public static final String TIMED_OUT_EVENT_NAME = "timed_out_event_name";
        public static final String TIMED_OUT_EVENT_PARAMS = "timed_out_event_params";
        public static final String TIME_TO_LIVE = "time_to_live";
        public static final String TRIGGERED_EVENT_NAME = "triggered_event_name";
        public static final String TRIGGERED_EVENT_PARAMS = "triggered_event_params";
        public static final String TRIGGERED_TIMESTAMP = "triggered_timestamp";
        public static final String TRIGGER_EVENT_NAME = "trigger_event_name";
        public static final String TRIGGER_TIMEOUT = "trigger_timeout";
        public static final String VALUE = "value";

        private ConditionalUserProperty() {
        }
    }

    /* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
    public interface EventInterceptor extends zzgu {
        @Override // com.google.android.gms.measurement.internal.zzgu
        void interceptEvent(String str, String str2, Bundle bundle, long j);
    }

    /* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
    public interface OnEventListener extends zzgv {
        @Override // com.google.android.gms.measurement.internal.zzgv
        void onEvent(String str, String str2, Bundle bundle, long j);
    }

    public AppMeasurementSdk(zzee zzeeVar) {
        this.zza = zzeeVar;
    }

    public static AppMeasurementSdk getInstance(Context context) {
        return zzee.zza(context, null, null, null, null).zzb();
    }

    public void beginAdUnitExposure(String adUnitId) {
        this.zza.zzu(adUnitId);
    }

    public void clearConditionalUserProperty(String userPropertyName, String clearEventName, Bundle clearEventParams) {
        this.zza.zzl(userPropertyName, clearEventName, clearEventParams);
    }

    public void endAdUnitExposure(String adUnitId) {
        this.zza.zzv(adUnitId);
    }

    public long generateEventId() {
        return this.zza.zzy();
    }

    public String getAppIdOrigin() {
        return this.zza.zzG();
    }

    public String getAppInstanceId() {
        return this.zza.zzx();
    }

    public List<Bundle> getConditionalUserProperties(String origin, String propertyNamePrefix) {
        return this.zza.zzm(origin, propertyNamePrefix);
    }

    public String getCurrentScreenClass() {
        return this.zza.zzA();
    }

    public String getCurrentScreenName() {
        return this.zza.zzz();
    }

    public String getGmpAppId() {
        return this.zza.zzw();
    }

    public int getMaxUserProperties(String origin) {
        return this.zza.zzE(origin);
    }

    public Map<String, Object> getUserProperties(String origin, String propertyNamePrefix, boolean includeInternal) {
        return this.zza.zzB(origin, propertyNamePrefix, includeInternal);
    }

    public void logEvent(String origin, String name, Bundle params) {
        this.zza.zzh(origin, name, params);
    }

    public void logEventNoInterceptor(String origin, String name, Bundle params, long timestampInMillis) {
        this.zza.zzi(origin, name, params, timestampInMillis);
    }

    public void performAction(Bundle bundle) {
        this.zza.zzD(bundle, false);
    }

    public Bundle performActionWithResponse(Bundle bundle) {
        return this.zza.zzD(bundle, true);
    }

    public void registerOnMeasurementEventListener(OnEventListener listener) {
        this.zza.zze(listener);
    }

    public void setConditionalUserProperty(Bundle conditionalUserProperty) {
        this.zza.zzk(conditionalUserProperty);
    }

    public void setConsent(Bundle consentMap) {
        this.zza.zzq(consentMap);
    }

    public void setCurrentScreen(Activity activity, String screenName, String screenClassOverride) {
        this.zza.zzo(activity, screenName, screenClassOverride);
    }

    public void setEventInterceptor(EventInterceptor interceptor) {
        this.zza.zzd(interceptor);
    }

    public void setMeasurementEnabled(Boolean enabled) {
        this.zza.zzp(enabled);
    }

    public void setUserProperty(String origin, String name, Object value) {
        this.zza.zzj(origin, name, value, true);
    }

    public void unregisterOnMeasurementEventListener(OnEventListener listener) {
        this.zza.zzf(listener);
    }

    public final void zza(boolean z) {
        this.zza.zzI(z);
    }

    public void setMeasurementEnabled(boolean enabled) {
        this.zza.zzp(Boolean.valueOf(enabled));
    }

    public static AppMeasurementSdk getInstance(Context context, String logTag, String origin, String customAppId, Bundle extraParameters) {
        return zzee.zza(context, logTag, origin, customAppId, extraParameters).zzb();
    }
}
