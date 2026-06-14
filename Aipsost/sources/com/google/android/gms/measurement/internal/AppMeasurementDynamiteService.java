package com.google.android.gms.measurement.internal;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.RemoteException;
import android.text.TextUtils;
import androidx.collection.ArrayMap;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.dynamic.ObjectWrapper;
import com.google.android.gms.internal.measurement.zzod;
import java.util.Map;
import org.checkerframework.checker.nullness.qual.EnsuresNonNull;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public class AppMeasurementDynamiteService extends com.google.android.gms.internal.measurement.zzcb {
    zzfu zza = null;
    private final Map<Integer, zzgv> zzb = new ArrayMap();

    @EnsuresNonNull({"scion"})
    private final void zzb() {
        if (this.zza == null) {
            throw new IllegalStateException("Attempting to perform action before initialize.");
        }
    }

    private final void zzc(com.google.android.gms.internal.measurement.zzcf zzcfVar, String str) {
        zzb();
        this.zza.zzl().zzad(zzcfVar, str);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void beginAdUnitExposure(String adUnitId, long timestamp) throws RemoteException {
        zzb();
        this.zza.zzB().zza(adUnitId, timestamp);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void clearConditionalUserProperty(String userPropertyName, String clearEventName, Bundle clearEventParams) throws RemoteException {
        zzb();
        this.zza.zzk().zzO(userPropertyName, clearEventName, clearEventParams);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void clearMeasurementEnabled(long j) throws RemoteException {
        zzb();
        this.zza.zzk().zzn(null);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void endAdUnitExposure(String adUnitId, long timestamp) throws RemoteException {
        zzb();
        this.zza.zzB().zzb(adUnitId, timestamp);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void generateEventId(com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        long jZzd = this.zza.zzl().zzd();
        zzb();
        this.zza.zzl().zzae(receiver, jZzd);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getAppInstanceId(com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        this.zza.zzav().zzh(new zzh(this, receiver));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getCachedAppInstanceId(com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        zzc(receiver, this.zza.zzk().zzD());
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getConditionalUserProperties(String origin, String propertyNamePrefix, com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        this.zza.zzav().zzh(new zzl(this, receiver, origin, propertyNamePrefix));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getCurrentScreenClass(com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        zzc(receiver, this.zza.zzk().zzS());
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getCurrentScreenName(com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        zzc(receiver, this.zza.zzk().zzR());
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getGmpAppId(com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        zzc(receiver, this.zza.zzk().zzT());
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getMaxUserProperties(String origin, com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        this.zza.zzk().zzL(origin);
        zzb();
        this.zza.zzl().zzaf(receiver, 25);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getTestFlag(com.google.android.gms.internal.measurement.zzcf receiver, int type) throws RemoteException {
        zzb();
        switch (type) {
            case 0:
                this.zza.zzl().zzad(receiver, this.zza.zzk().zzj());
                break;
            case 1:
                this.zza.zzl().zzae(receiver, this.zza.zzk().zzk().longValue());
                break;
            case 2:
                zzku zzkuVarZzl = this.zza.zzl();
                double dDoubleValue = this.zza.zzk().zzm().doubleValue();
                Bundle bundle = new Bundle();
                bundle.putDouble("r", dDoubleValue);
                try {
                    receiver.zzb(bundle);
                } catch (RemoteException e) {
                    zzkuVarZzl.zzs.zzau().zze().zzb("Error returning double value to wrapper", e);
                    return;
                }
                break;
            case 3:
                this.zza.zzl().zzaf(receiver, this.zza.zzk().zzl().intValue());
                break;
            case 4:
                this.zza.zzl().zzah(receiver, this.zza.zzk().zzi().booleanValue());
                break;
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void getUserProperties(String origin, String propertyNamePrefix, boolean getInternal, com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        this.zza.zzav().zzh(new zzj(this, receiver, origin, propertyNamePrefix, getInternal));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void initForTests(Map map) throws RemoteException {
        zzb();
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void initialize(IObjectWrapper context, com.google.android.gms.internal.measurement.zzcl params, long timestamp) throws RemoteException {
        zzfu zzfuVar = this.zza;
        if (zzfuVar == null) {
            this.zza = zzfu.zzC((Context) Preconditions.checkNotNull((Context) ObjectWrapper.unwrap(context)), params, Long.valueOf(timestamp));
        } else {
            zzfuVar.zzau().zze().zza("Attempting to initialize multiple times");
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void isDataCollectionEnabled(com.google.android.gms.internal.measurement.zzcf receiver) throws RemoteException {
        zzb();
        this.zza.zzav().zzh(new zzm(this, receiver));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void logEvent(String origin, String name, Bundle params, boolean isInternal, boolean allowInterceptor, long timestamp) throws RemoteException {
        zzb();
        this.zza.zzk().zzv(origin, name, params, isInternal, allowInterceptor, timestamp);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void logEventAndBundle(String packageName, String eventName, Bundle params, com.google.android.gms.internal.measurement.zzcf receiver, long timestamp) throws RemoteException {
        zzb();
        Preconditions.checkNotEmpty(eventName);
        (params != null ? new Bundle(params) : new Bundle()).putString("_o", "app");
        this.zza.zzav().zzh(new zzi(this, receiver, new zzas(eventName, new zzaq(params), "app", timestamp), packageName));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void logHealthData(int priority, String key, IObjectWrapper context1, IObjectWrapper context2, IObjectWrapper context3) throws RemoteException {
        zzb();
        this.zza.zzau().zzm(priority, true, false, key, context1 == null ? null : ObjectWrapper.unwrap(context1), context2 == null ? null : ObjectWrapper.unwrap(context2), context3 == null ? null : ObjectWrapper.unwrap(context3));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void onActivityCreated(IObjectWrapper activity, Bundle savedInstanceState, long j) throws RemoteException {
        zzb();
        zzhv zzhvVar = this.zza.zzk().zza;
        if (zzhvVar != null) {
            this.zza.zzk().zzh();
            zzhvVar.onActivityCreated((Activity) ObjectWrapper.unwrap(activity), savedInstanceState);
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void onActivityDestroyed(IObjectWrapper activity, long j) throws RemoteException {
        zzb();
        zzhv zzhvVar = this.zza.zzk().zza;
        if (zzhvVar != null) {
            this.zza.zzk().zzh();
            zzhvVar.onActivityDestroyed((Activity) ObjectWrapper.unwrap(activity));
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void onActivityPaused(IObjectWrapper activity, long j) throws RemoteException {
        zzb();
        zzhv zzhvVar = this.zza.zzk().zza;
        if (zzhvVar != null) {
            this.zza.zzk().zzh();
            zzhvVar.onActivityPaused((Activity) ObjectWrapper.unwrap(activity));
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void onActivityResumed(IObjectWrapper activity, long j) throws RemoteException {
        zzb();
        zzhv zzhvVar = this.zza.zzk().zza;
        if (zzhvVar != null) {
            this.zza.zzk().zzh();
            zzhvVar.onActivityResumed((Activity) ObjectWrapper.unwrap(activity));
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void onActivitySaveInstanceState(IObjectWrapper activity, com.google.android.gms.internal.measurement.zzcf receiver, long j) throws RemoteException {
        zzb();
        zzhv zzhvVar = this.zza.zzk().zza;
        Bundle bundle = new Bundle();
        if (zzhvVar != null) {
            this.zza.zzk().zzh();
            zzhvVar.onActivitySaveInstanceState((Activity) ObjectWrapper.unwrap(activity), bundle);
        }
        try {
            receiver.zzb(bundle);
        } catch (RemoteException e) {
            this.zza.zzau().zze().zzb("Error returning bundle value to wrapper", e);
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void onActivityStarted(IObjectWrapper activity, long j) throws RemoteException {
        zzb();
        if (this.zza.zzk().zza != null) {
            this.zza.zzk().zzh();
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void onActivityStopped(IObjectWrapper activity, long j) throws RemoteException {
        zzb();
        if (this.zza.zzk().zza != null) {
            this.zza.zzk().zzh();
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void performAction(Bundle bundle, com.google.android.gms.internal.measurement.zzcf receiver, long j) throws RemoteException {
        zzb();
        receiver.zzb(null);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void registerOnMeasurementEventListener(com.google.android.gms.internal.measurement.zzci listenerProxy) throws RemoteException {
        zzgv zzoVar;
        zzb();
        synchronized (this.zzb) {
            zzoVar = this.zzb.get(Integer.valueOf(listenerProxy.zze()));
            if (zzoVar == null) {
                zzoVar = new zzo(this, listenerProxy);
                this.zzb.put(Integer.valueOf(listenerProxy.zze()), zzoVar);
            }
        }
        this.zza.zzk().zzJ(zzoVar);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void resetAnalyticsData(long timestamp) throws RemoteException {
        zzb();
        this.zza.zzk().zzF(timestamp);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setConditionalUserProperty(Bundle conditionalUserProperty, long timestamp) throws RemoteException {
        zzb();
        if (conditionalUserProperty == null) {
            this.zza.zzau().zzb().zza("Conditional user property must not be null");
        } else {
            this.zza.zzk().zzN(conditionalUserProperty, timestamp);
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setConsent(Bundle consentMap, long timestamp) throws RemoteException {
        zzb();
        zzhw zzhwVarZzk = this.zza.zzk();
        zzod.zzb();
        if (!zzhwVarZzk.zzs.zzc().zzn(null, zzea.zzaC) || TextUtils.isEmpty(zzhwVarZzk.zzs.zzA().zzj())) {
            zzhwVarZzk.zzo(consentMap, 0, timestamp);
        } else {
            zzhwVarZzk.zzs.zzau().zzh().zza("Using developer consent only; google app id found");
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setConsentThirdParty(Bundle consentMap, long timestamp) throws RemoteException {
        zzb();
        this.zza.zzk().zzo(consentMap, -20, timestamp);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setCurrentScreen(IObjectWrapper activity, String screenName, String screenClassOverride, long j) throws RemoteException {
        zzb();
        this.zza.zzx().zzk((Activity) ObjectWrapper.unwrap(activity), screenName, screenClassOverride);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setDataCollectionEnabled(boolean enabled) throws RemoteException {
        zzb();
        zzhw zzhwVarZzk = this.zza.zzk();
        zzhwVarZzk.zzb();
        zzfu zzfuVar = zzhwVarZzk.zzs;
        zzhwVarZzk.zzs.zzav().zzh(new zzgz(zzhwVarZzk, enabled));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setDefaultEventParameters(Bundle parameters) {
        zzb();
        final zzhw zzhwVarZzk = this.zza.zzk();
        final Bundle bundle = parameters == null ? null : new Bundle(parameters);
        zzhwVarZzk.zzs.zzav().zzh(new Runnable(zzhwVarZzk, bundle) { // from class: com.google.android.gms.measurement.internal.zzgx
            private final zzhw zza;
            private final Bundle zzb;

            {
                this.zza = zzhwVarZzk;
                this.zzb = bundle;
            }

            @Override // java.lang.Runnable
            public final void run() {
                this.zza.zzU(this.zzb);
            }
        });
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setEventInterceptor(com.google.android.gms.internal.measurement.zzci interceptor) throws RemoteException {
        zzb();
        zzn zznVar = new zzn(this, interceptor);
        if (this.zza.zzav().zzd()) {
            this.zza.zzk().zzI(zznVar);
        } else {
            this.zza.zzav().zzh(new zzk(this, zznVar));
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setInstanceIdProvider(com.google.android.gms.internal.measurement.zzck zzckVar) throws RemoteException {
        zzb();
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setMeasurementEnabled(boolean enabled, long j) throws RemoteException {
        zzb();
        this.zza.zzk().zzn(Boolean.valueOf(enabled));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setMinimumSessionDuration(long j) throws RemoteException {
        zzb();
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setSessionTimeoutDuration(long milliseconds) throws RemoteException {
        zzb();
        zzhw zzhwVarZzk = this.zza.zzk();
        zzfu zzfuVar = zzhwVarZzk.zzs;
        zzhwVarZzk.zzs.zzav().zzh(new zzhb(zzhwVarZzk, milliseconds));
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setUserId(String id, long timestamp) throws RemoteException {
        zzb();
        if (this.zza.zzc().zzn(null, zzea.zzaA) && id != null && id.length() == 0) {
            this.zza.zzau().zze().zza("User ID must be non-empty");
        } else {
            this.zza.zzk().zzz(null, "_id", id, true, timestamp);
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void setUserProperty(String origin, String name, IObjectWrapper value, boolean isInternal, long timestamp) throws RemoteException {
        zzb();
        this.zza.zzk().zzz(origin, name, ObjectWrapper.unwrap(value), isInternal, timestamp);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public void unregisterOnMeasurementEventListener(com.google.android.gms.internal.measurement.zzci listenerProxy) throws RemoteException {
        zzgv zzgvVarRemove;
        zzb();
        synchronized (this.zzb) {
            zzgvVarRemove = this.zzb.remove(Integer.valueOf(listenerProxy.zze()));
        }
        if (zzgvVarRemove == null) {
            zzgvVarRemove = new zzo(this, listenerProxy);
        }
        this.zza.zzk().zzK(zzgvVarRemove);
    }
}
