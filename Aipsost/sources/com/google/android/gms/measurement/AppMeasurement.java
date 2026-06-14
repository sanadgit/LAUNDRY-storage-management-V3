package com.google.android.gms.measurement;

import android.content.Context;
import android.os.Bundle;
import androidx.collection.ArrayMap;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.internal.measurement.zzcl;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import com.google.android.gms.measurement.internal.zzfu;
import com.google.android.gms.measurement.internal.zzgq;
import com.google.android.gms.measurement.internal.zzgu;
import com.google.android.gms.measurement.internal.zzgv;
import com.google.android.gms.measurement.internal.zzhx;
import com.google.android.gms.measurement.internal.zzic;
import com.google.android.gms.measurement.internal.zzkq;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
@Deprecated
public class AppMeasurement {
    public static final String CRASH_ORIGIN = "crash";
    public static final String FCM_ORIGIN = "fcm";
    public static final String FIAM_ORIGIN = "fiam";
    private static volatile AppMeasurement zza;
    private final zzfu zzb;
    private final zzhx zzc;

    /* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
    public interface EventInterceptor extends zzgu {
        @Override // com.google.android.gms.measurement.internal.zzgu
        void interceptEvent(String str, String str2, Bundle bundle, long j);
    }

    /* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
    public interface OnEventListener extends zzgv {
        @Override // com.google.android.gms.measurement.internal.zzgv
        void onEvent(String str, String str2, Bundle bundle, long j);
    }

    public AppMeasurement(zzfu zzfuVar) {
        Preconditions.checkNotNull(zzfuVar);
        this.zzb = zzfuVar;
        this.zzc = null;
    }

    @Deprecated
    public static AppMeasurement getInstance(Context context) {
        zzhx zzhxVar;
        if (zza == null) {
            synchronized (AppMeasurement.class) {
                if (zza == null) {
                    try {
                        try {
                            zzhxVar = (zzhx) Class.forName("com.google.firebase.analytics.FirebaseAnalytics").getDeclaredMethod("getScionFrontendApiImplementation", Context.class, Bundle.class).invoke(null, context, null);
                        } catch (Exception e) {
                            zzhxVar = null;
                        }
                    } catch (ClassNotFoundException e2) {
                    }
                    if (zzhxVar != null) {
                        zza = new AppMeasurement(zzhxVar);
                    } else {
                        zza = new AppMeasurement(zzfu.zzC(context, new zzcl(0L, 0L, true, null, null, null, null, null), null));
                    }
                }
            }
        }
        return zza;
    }

    public void beginAdUnitExposure(String adUnitId) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zzl(adUnitId);
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzB().zza(adUnitId, this.zzb.zzay().elapsedRealtime());
        }
    }

    public void clearConditionalUserProperty(String userPropertyName, String clearEventName, Bundle clearEventParams) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zzo(userPropertyName, clearEventName, clearEventParams);
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzk().zzO(userPropertyName, clearEventName, clearEventParams);
        }
    }

    public void endAdUnitExposure(String adUnitId) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zzm(adUnitId);
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzB().zzb(adUnitId, this.zzb.zzay().elapsedRealtime());
        }
    }

    public long generateEventId() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return zzhxVar.zzk();
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzl().zzd();
    }

    public String getAppInstanceId() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return zzhxVar.zzi();
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzD();
    }

    public Boolean getBoolean() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return (Boolean) zzhxVar.zzr(4);
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzi();
    }

    public List<ConditionalUserProperty> getConditionalUserProperties(String origin, String propertyNamePrefix) {
        List<Bundle> listZzP;
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            listZzP = zzhxVar.zzp(origin, propertyNamePrefix);
        } else {
            Preconditions.checkNotNull(this.zzb);
            listZzP = this.zzb.zzk().zzP(origin, propertyNamePrefix);
        }
        ArrayList arrayList = new ArrayList(listZzP == null ? 0 : listZzP.size());
        Iterator<Bundle> it = listZzP.iterator();
        while (it.hasNext()) {
            arrayList.add(new ConditionalUserProperty(it.next()));
        }
        return arrayList;
    }

    public String getCurrentScreenClass() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return zzhxVar.zzh();
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzS();
    }

    public String getCurrentScreenName() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return zzhxVar.zzg();
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzR();
    }

    public Double getDouble() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return (Double) zzhxVar.zzr(2);
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzm();
    }

    public String getGmpAppId() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return zzhxVar.zzj();
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzT();
    }

    public Integer getInteger() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return (Integer) zzhxVar.zzr(3);
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzl();
    }

    public Long getLong() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return (Long) zzhxVar.zzr(1);
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzk();
    }

    public int getMaxUserProperties(String origin) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return zzhxVar.zzq(origin);
        }
        Preconditions.checkNotNull(this.zzb);
        this.zzb.zzk().zzL(origin);
        return 25;
    }

    public String getString() {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return (String) zzhxVar.zzr(0);
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzj();
    }

    protected Map<String, Object> getUserProperties(String origin, String propertyNamePrefix, boolean includeInternal) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return zzhxVar.zzc(origin, propertyNamePrefix, includeInternal);
        }
        Preconditions.checkNotNull(this.zzb);
        return this.zzb.zzk().zzQ(origin, propertyNamePrefix, includeInternal);
    }

    public void logEventInternal(String origin, String name, Bundle params) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zza(origin, name, params);
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzk().zzs(origin, name, params);
        }
    }

    public void logEventInternalNoInterceptor(String origin, String name, Bundle params, long timestampInMillis) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zzb(origin, name, params, timestampInMillis);
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzk().zzv(origin, name, params, true, false, timestampInMillis);
        }
    }

    public void registerOnMeasurementEventListener(OnEventListener listener) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zze(listener);
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzk().zzJ(listener);
        }
    }

    public void setConditionalUserProperty(ConditionalUserProperty conditionalUserProperty) {
        Preconditions.checkNotNull(conditionalUserProperty);
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zzn(conditionalUserProperty.zza());
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzk().zzM(conditionalUserProperty.zza());
        }
    }

    public void setEventInterceptor(EventInterceptor interceptor) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zzd(interceptor);
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzk().zzI(interceptor);
        }
    }

    public void unregisterOnMeasurementEventListener(OnEventListener listener) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            zzhxVar.zzf(listener);
        } else {
            Preconditions.checkNotNull(this.zzb);
            this.zzb.zzk().zzK(listener);
        }
    }

    public AppMeasurement(zzhx zzhxVar) {
        Preconditions.checkNotNull(zzhxVar);
        this.zzc = zzhxVar;
        this.zzb = null;
    }

    public Map<String, Object> getUserProperties(boolean includeInternal) {
        zzhx zzhxVar = this.zzc;
        if (zzhxVar != null) {
            return zzhxVar.zzc(null, null, includeInternal);
        }
        Preconditions.checkNotNull(this.zzb);
        List<zzkq> listZzC = this.zzb.zzk().zzC(includeInternal);
        ArrayMap arrayMap = new ArrayMap(listZzC.size());
        for (zzkq zzkqVar : listZzC) {
            Object objZza = zzkqVar.zza();
            if (objZza != null) {
                arrayMap.put(zzkqVar.zzb, objZza);
            }
        }
        return arrayMap;
    }

    /* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
    public static class ConditionalUserProperty {
        public boolean mActive;
        public String mAppId;
        public long mCreationTimestamp;
        public String mExpiredEventName;
        public Bundle mExpiredEventParams;
        public String mName;
        public String mOrigin;
        public long mTimeToLive;
        public String mTimedOutEventName;
        public Bundle mTimedOutEventParams;
        public String mTriggerEventName;
        public long mTriggerTimeout;
        public String mTriggeredEventName;
        public Bundle mTriggeredEventParams;
        public long mTriggeredTimestamp;
        public Object mValue;

        public ConditionalUserProperty() {
        }

        ConditionalUserProperty(Bundle bundle) {
            Preconditions.checkNotNull(bundle);
            this.mAppId = (String) zzgq.zzb(bundle, "app_id", String.class, null);
            this.mOrigin = (String) zzgq.zzb(bundle, "origin", String.class, null);
            this.mName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.NAME, String.class, null);
            this.mValue = zzgq.zzb(bundle, "value", Object.class, null);
            this.mTriggerEventName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME, String.class, null);
            this.mTriggerTimeout = ((Long) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT, Long.class, 0L)).longValue();
            this.mTimedOutEventName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_NAME, String.class, null);
            this.mTimedOutEventParams = (Bundle) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_PARAMS, Bundle.class, null);
            this.mTriggeredEventName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_NAME, String.class, null);
            this.mTriggeredEventParams = (Bundle) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_PARAMS, Bundle.class, null);
            this.mTimeToLive = ((Long) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE, Long.class, 0L)).longValue();
            this.mExpiredEventName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME, String.class, null);
            this.mExpiredEventParams = (Bundle) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS, Bundle.class, null);
            this.mActive = ((Boolean) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.ACTIVE, Boolean.class, false)).booleanValue();
            this.mCreationTimestamp = ((Long) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP, Long.class, 0L)).longValue();
            this.mTriggeredTimestamp = ((Long) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_TIMESTAMP, Long.class, 0L)).longValue();
        }

        final Bundle zza() {
            Bundle bundle = new Bundle();
            String str = this.mAppId;
            if (str != null) {
                bundle.putString("app_id", str);
            }
            String str2 = this.mOrigin;
            if (str2 != null) {
                bundle.putString("origin", str2);
            }
            String str3 = this.mName;
            if (str3 != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.NAME, str3);
            }
            Object obj = this.mValue;
            if (obj != null) {
                zzgq.zza(bundle, obj);
            }
            String str4 = this.mTriggerEventName;
            if (str4 != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME, str4);
            }
            bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT, this.mTriggerTimeout);
            String str5 = this.mTimedOutEventName;
            if (str5 != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_NAME, str5);
            }
            Bundle bundle2 = this.mTimedOutEventParams;
            if (bundle2 != null) {
                bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_PARAMS, bundle2);
            }
            String str6 = this.mTriggeredEventName;
            if (str6 != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_NAME, str6);
            }
            Bundle bundle3 = this.mTriggeredEventParams;
            if (bundle3 != null) {
                bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_PARAMS, bundle3);
            }
            bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE, this.mTimeToLive);
            String str7 = this.mExpiredEventName;
            if (str7 != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME, str7);
            }
            Bundle bundle4 = this.mExpiredEventParams;
            if (bundle4 != null) {
                bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS, bundle4);
            }
            bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP, this.mCreationTimestamp);
            bundle.putBoolean(AppMeasurementSdk.ConditionalUserProperty.ACTIVE, this.mActive);
            bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_TIMESTAMP, this.mTriggeredTimestamp);
            return bundle;
        }

        public ConditionalUserProperty(ConditionalUserProperty other) throws Throwable {
            Preconditions.checkNotNull(other);
            this.mAppId = other.mAppId;
            this.mOrigin = other.mOrigin;
            this.mCreationTimestamp = other.mCreationTimestamp;
            this.mName = other.mName;
            Object obj = other.mValue;
            if (obj != null) {
                Object objZzb = zzic.zzb(obj);
                this.mValue = objZzb;
                if (objZzb == null) {
                    this.mValue = other.mValue;
                }
            }
            this.mActive = other.mActive;
            this.mTriggerEventName = other.mTriggerEventName;
            this.mTriggerTimeout = other.mTriggerTimeout;
            this.mTimedOutEventName = other.mTimedOutEventName;
            Bundle bundle = other.mTimedOutEventParams;
            if (bundle != null) {
                this.mTimedOutEventParams = new Bundle(bundle);
            }
            this.mTriggeredEventName = other.mTriggeredEventName;
            Bundle bundle2 = other.mTriggeredEventParams;
            if (bundle2 != null) {
                this.mTriggeredEventParams = new Bundle(bundle2);
            }
            this.mTriggeredTimestamp = other.mTriggeredTimestamp;
            this.mTimeToLive = other.mTimeToLive;
            this.mExpiredEventName = other.mExpiredEventName;
            Bundle bundle3 = other.mExpiredEventParams;
            if (bundle3 != null) {
                this.mExpiredEventParams = new Bundle(bundle3);
            }
        }
    }
}
