package com.google.android.gms.internal.measurement;

import android.os.Bundle;
import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzca extends zzbm implements zzcc {
    zzca(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.measurement.api.internal.IAppMeasurementDynamiteService");
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void beginAdUnitExposure(String str, long j) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeLong(j);
        zzc(23, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void clearConditionalUserProperty(String str, String str2, Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        zzbo.zzd(parcelZza, bundle);
        zzc(9, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void clearMeasurementEnabled(long j) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeLong(j);
        zzc(43, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void endAdUnitExposure(String str, long j) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeLong(j);
        zzc(24, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void generateEventId(zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzcfVar);
        zzc(22, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getAppInstanceId(zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzcfVar);
        zzc(20, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getCachedAppInstanceId(zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzcfVar);
        zzc(19, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getConditionalUserProperties(String str, String str2, zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        zzbo.zze(parcelZza, zzcfVar);
        zzc(10, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getCurrentScreenClass(zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzcfVar);
        zzc(17, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getCurrentScreenName(zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzcfVar);
        zzc(16, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getGmpAppId(zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzcfVar);
        zzc(21, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getMaxUserProperties(String str, zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        zzbo.zze(parcelZza, zzcfVar);
        zzc(6, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getTestFlag(zzcf zzcfVar, int i) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzcfVar);
        parcelZza.writeInt(i);
        zzc(38, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void getUserProperties(String str, String str2, boolean z, zzcf zzcfVar) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        zzbo.zzb(parcelZza, z);
        zzbo.zze(parcelZza, zzcfVar);
        zzc(5, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void initForTests(Map map) throws RemoteException {
        throw null;
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void initialize(IObjectWrapper iObjectWrapper, zzcl zzclVar, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        zzbo.zzd(parcelZza, zzclVar);
        parcelZza.writeLong(j);
        zzc(1, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void isDataCollectionEnabled(zzcf zzcfVar) throws RemoteException {
        throw null;
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void logEvent(String str, String str2, Bundle bundle, boolean z, boolean z2, long j) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        zzbo.zzd(parcelZza, bundle);
        zzbo.zzb(parcelZza, z);
        zzbo.zzb(parcelZza, z2);
        parcelZza.writeLong(j);
        zzc(2, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void logEventAndBundle(String str, String str2, Bundle bundle, zzcf zzcfVar, long j) throws RemoteException {
        throw null;
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void logHealthData(int i, String str, IObjectWrapper iObjectWrapper, IObjectWrapper iObjectWrapper2, IObjectWrapper iObjectWrapper3) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(5);
        parcelZza.writeString(str);
        zzbo.zze(parcelZza, iObjectWrapper);
        zzbo.zze(parcelZza, iObjectWrapper2);
        zzbo.zze(parcelZza, iObjectWrapper3);
        zzc(33, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void onActivityCreated(IObjectWrapper iObjectWrapper, Bundle bundle, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        zzbo.zzd(parcelZza, bundle);
        parcelZza.writeLong(j);
        zzc(27, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void onActivityDestroyed(IObjectWrapper iObjectWrapper, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        parcelZza.writeLong(j);
        zzc(28, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void onActivityPaused(IObjectWrapper iObjectWrapper, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        parcelZza.writeLong(j);
        zzc(29, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void onActivityResumed(IObjectWrapper iObjectWrapper, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        parcelZza.writeLong(j);
        zzc(30, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void onActivitySaveInstanceState(IObjectWrapper iObjectWrapper, zzcf zzcfVar, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        zzbo.zze(parcelZza, zzcfVar);
        parcelZza.writeLong(j);
        zzc(31, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void onActivityStarted(IObjectWrapper iObjectWrapper, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        parcelZza.writeLong(j);
        zzc(25, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void onActivityStopped(IObjectWrapper iObjectWrapper, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        parcelZza.writeLong(j);
        zzc(26, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void performAction(Bundle bundle, zzcf zzcfVar, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zzd(parcelZza, bundle);
        zzbo.zze(parcelZza, zzcfVar);
        parcelZza.writeLong(j);
        zzc(32, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void registerOnMeasurementEventListener(zzci zzciVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzciVar);
        zzc(35, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void resetAnalyticsData(long j) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeLong(j);
        zzc(12, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setConditionalUserProperty(Bundle bundle, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zzd(parcelZza, bundle);
        parcelZza.writeLong(j);
        zzc(8, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setConsent(Bundle bundle, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zzd(parcelZza, bundle);
        parcelZza.writeLong(j);
        zzc(44, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setConsentThirdParty(Bundle bundle, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zzd(parcelZza, bundle);
        parcelZza.writeLong(j);
        zzc(45, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setCurrentScreen(IObjectWrapper iObjectWrapper, String str, String str2, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, iObjectWrapper);
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        parcelZza.writeLong(j);
        zzc(15, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setDataCollectionEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zzb(parcelZza, z);
        zzc(39, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setDefaultEventParameters(Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zzd(parcelZza, bundle);
        zzc(42, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setEventInterceptor(zzci zzciVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzciVar);
        zzc(34, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setInstanceIdProvider(zzck zzckVar) throws RemoteException {
        throw null;
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setMeasurementEnabled(boolean z, long j) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zzb(parcelZza, z);
        parcelZza.writeLong(j);
        zzc(11, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setMinimumSessionDuration(long j) throws RemoteException {
        throw null;
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setSessionTimeoutDuration(long j) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeLong(j);
        zzc(14, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setUserId(String str, long j) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeLong(j);
        zzc(7, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void setUserProperty(String str, String str2, IObjectWrapper iObjectWrapper, boolean z, long j) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        zzbo.zze(parcelZza, iObjectWrapper);
        zzbo.zzb(parcelZza, z);
        parcelZza.writeLong(j);
        zzc(4, parcelZza);
    }

    @Override // com.google.android.gms.internal.measurement.zzcc
    public final void unregisterOnMeasurementEventListener(zzci zzciVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zze(parcelZza, zzciVar);
        zzc(36, parcelZza);
    }
}
