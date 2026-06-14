package com.google.android.gms.internal.measurement;

import android.os.Bundle;
import android.os.IBinder;
import android.os.IInterface;
import android.os.Parcel;
import android.os.RemoteException;
import androidx.constraintlayout.widget.ConstraintLayout;
import com.google.android.gms.dynamic.IObjectWrapper;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzcb extends zzbn implements zzcc {
    public zzcb() {
        super("com.google.android.gms.measurement.api.internal.IAppMeasurementDynamiteService");
    }

    public static zzcc asInterface(IBinder obj) {
        if (obj == null) {
            return null;
        }
        IInterface iInterfaceQueryLocalInterface = obj.queryLocalInterface("com.google.android.gms.measurement.api.internal.IAppMeasurementDynamiteService");
        return iInterfaceQueryLocalInterface instanceof zzcc ? (zzcc) iInterfaceQueryLocalInterface : new zzca(obj);
    }

    @Override // com.google.android.gms.internal.measurement.zzbn
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        zzcf zzcdVar;
        zzcf zzcdVar2 = null;
        zzcf zzcdVar3 = null;
        zzcf zzcdVar4 = null;
        zzci zzcgVar = null;
        zzci zzcgVar2 = null;
        zzci zzcgVar3 = null;
        zzcf zzcdVar5 = null;
        zzcf zzcdVar6 = null;
        zzcf zzcdVar7 = null;
        zzcf zzcdVar8 = null;
        zzcf zzcdVar9 = null;
        zzcf zzcdVar10 = null;
        zzck zzcjVar = null;
        zzcf zzcdVar11 = null;
        zzcf zzcdVar12 = null;
        zzcf zzcdVar13 = null;
        zzcf zzcdVar14 = null;
        switch (i) {
            case 1:
                initialize(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), (zzcl) zzbo.zzc(parcel, zzcl.CREATOR), parcel.readLong());
                break;
            case 2:
                logEvent(parcel.readString(), parcel.readString(), (Bundle) zzbo.zzc(parcel, Bundle.CREATOR), zzbo.zza(parcel), zzbo.zza(parcel), parcel.readLong());
                break;
            case 3:
                String string = parcel.readString();
                String string2 = parcel.readString();
                Bundle bundle = (Bundle) zzbo.zzc(parcel, Bundle.CREATOR);
                IBinder strongBinder = parcel.readStrongBinder();
                if (strongBinder == null) {
                    zzcdVar = null;
                } else {
                    IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar = iInterfaceQueryLocalInterface instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface : new zzcd(strongBinder);
                }
                logEventAndBundle(string, string2, bundle, zzcdVar, parcel.readLong());
                break;
            case 4:
                setUserProperty(parcel.readString(), parcel.readString(), IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), zzbo.zza(parcel), parcel.readLong());
                break;
            case 5:
                String string3 = parcel.readString();
                String string4 = parcel.readString();
                boolean zZza = zzbo.zza(parcel);
                IBinder strongBinder2 = parcel.readStrongBinder();
                if (strongBinder2 != null) {
                    IInterface iInterfaceQueryLocalInterface2 = strongBinder2.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar2 = iInterfaceQueryLocalInterface2 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface2 : new zzcd(strongBinder2);
                }
                getUserProperties(string3, string4, zZza, zzcdVar2);
                break;
            case 6:
                String string5 = parcel.readString();
                IBinder strongBinder3 = parcel.readStrongBinder();
                if (strongBinder3 != null) {
                    IInterface iInterfaceQueryLocalInterface3 = strongBinder3.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar14 = iInterfaceQueryLocalInterface3 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface3 : new zzcd(strongBinder3);
                }
                getMaxUserProperties(string5, zzcdVar14);
                break;
            case 7:
                setUserId(parcel.readString(), parcel.readLong());
                break;
            case 8:
                setConditionalUserProperty((Bundle) zzbo.zzc(parcel, Bundle.CREATOR), parcel.readLong());
                break;
            case 9:
                clearConditionalUserProperty(parcel.readString(), parcel.readString(), (Bundle) zzbo.zzc(parcel, Bundle.CREATOR));
                break;
            case 10:
                String string6 = parcel.readString();
                String string7 = parcel.readString();
                IBinder strongBinder4 = parcel.readStrongBinder();
                if (strongBinder4 != null) {
                    IInterface iInterfaceQueryLocalInterface4 = strongBinder4.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar13 = iInterfaceQueryLocalInterface4 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface4 : new zzcd(strongBinder4);
                }
                getConditionalUserProperties(string6, string7, zzcdVar13);
                break;
            case 11:
                setMeasurementEnabled(zzbo.zza(parcel), parcel.readLong());
                break;
            case 12:
                resetAnalyticsData(parcel.readLong());
                break;
            case 13:
                setMinimumSessionDuration(parcel.readLong());
                break;
            case 14:
                setSessionTimeoutDuration(parcel.readLong());
                break;
            case 15:
                setCurrentScreen(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), parcel.readString(), parcel.readString(), parcel.readLong());
                break;
            case 16:
                IBinder strongBinder5 = parcel.readStrongBinder();
                if (strongBinder5 != null) {
                    IInterface iInterfaceQueryLocalInterface5 = strongBinder5.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar12 = iInterfaceQueryLocalInterface5 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface5 : new zzcd(strongBinder5);
                }
                getCurrentScreenName(zzcdVar12);
                break;
            case 17:
                IBinder strongBinder6 = parcel.readStrongBinder();
                if (strongBinder6 != null) {
                    IInterface iInterfaceQueryLocalInterface6 = strongBinder6.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar11 = iInterfaceQueryLocalInterface6 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface6 : new zzcd(strongBinder6);
                }
                getCurrentScreenClass(zzcdVar11);
                break;
            case 18:
                IBinder strongBinder7 = parcel.readStrongBinder();
                if (strongBinder7 != null) {
                    IInterface iInterfaceQueryLocalInterface7 = strongBinder7.queryLocalInterface("com.google.android.gms.measurement.api.internal.IStringProvider");
                    zzcjVar = iInterfaceQueryLocalInterface7 instanceof zzck ? (zzck) iInterfaceQueryLocalInterface7 : new zzcj(strongBinder7);
                }
                setInstanceIdProvider(zzcjVar);
                break;
            case 19:
                IBinder strongBinder8 = parcel.readStrongBinder();
                if (strongBinder8 != null) {
                    IInterface iInterfaceQueryLocalInterface8 = strongBinder8.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar10 = iInterfaceQueryLocalInterface8 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface8 : new zzcd(strongBinder8);
                }
                getCachedAppInstanceId(zzcdVar10);
                break;
            case 20:
                IBinder strongBinder9 = parcel.readStrongBinder();
                if (strongBinder9 != null) {
                    IInterface iInterfaceQueryLocalInterface9 = strongBinder9.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar9 = iInterfaceQueryLocalInterface9 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface9 : new zzcd(strongBinder9);
                }
                getAppInstanceId(zzcdVar9);
                break;
            case 21:
                IBinder strongBinder10 = parcel.readStrongBinder();
                if (strongBinder10 != null) {
                    IInterface iInterfaceQueryLocalInterface10 = strongBinder10.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar8 = iInterfaceQueryLocalInterface10 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface10 : new zzcd(strongBinder10);
                }
                getGmpAppId(zzcdVar8);
                break;
            case 22:
                IBinder strongBinder11 = parcel.readStrongBinder();
                if (strongBinder11 != null) {
                    IInterface iInterfaceQueryLocalInterface11 = strongBinder11.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar7 = iInterfaceQueryLocalInterface11 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface11 : new zzcd(strongBinder11);
                }
                generateEventId(zzcdVar7);
                break;
            case 23:
                beginAdUnitExposure(parcel.readString(), parcel.readLong());
                break;
            case 24:
                endAdUnitExposure(parcel.readString(), parcel.readLong());
                break;
            case 25:
                onActivityStarted(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), parcel.readLong());
                break;
            case 26:
                onActivityStopped(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), parcel.readLong());
                break;
            case 27:
                onActivityCreated(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), (Bundle) zzbo.zzc(parcel, Bundle.CREATOR), parcel.readLong());
                break;
            case 28:
                onActivityDestroyed(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), parcel.readLong());
                break;
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                onActivityPaused(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), parcel.readLong());
                break;
            case 30:
                onActivityResumed(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), parcel.readLong());
                break;
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
                IObjectWrapper iObjectWrapperAsInterface = IObjectWrapper.Stub.asInterface(parcel.readStrongBinder());
                IBinder strongBinder12 = parcel.readStrongBinder();
                if (strongBinder12 != null) {
                    IInterface iInterfaceQueryLocalInterface12 = strongBinder12.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar6 = iInterfaceQueryLocalInterface12 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface12 : new zzcd(strongBinder12);
                }
                onActivitySaveInstanceState(iObjectWrapperAsInterface, zzcdVar6, parcel.readLong());
                break;
            case 32:
                Bundle bundle2 = (Bundle) zzbo.zzc(parcel, Bundle.CREATOR);
                IBinder strongBinder13 = parcel.readStrongBinder();
                if (strongBinder13 != null) {
                    IInterface iInterfaceQueryLocalInterface13 = strongBinder13.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar5 = iInterfaceQueryLocalInterface13 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface13 : new zzcd(strongBinder13);
                }
                performAction(bundle2, zzcdVar5, parcel.readLong());
                break;
            case 33:
                logHealthData(parcel.readInt(), parcel.readString(), IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()), IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()));
                break;
            case 34:
                IBinder strongBinder14 = parcel.readStrongBinder();
                if (strongBinder14 != null) {
                    IInterface iInterfaceQueryLocalInterface14 = strongBinder14.queryLocalInterface("com.google.android.gms.measurement.api.internal.IEventHandlerProxy");
                    zzcgVar3 = iInterfaceQueryLocalInterface14 instanceof zzci ? (zzci) iInterfaceQueryLocalInterface14 : new zzcg(strongBinder14);
                }
                setEventInterceptor(zzcgVar3);
                break;
            case 35:
                IBinder strongBinder15 = parcel.readStrongBinder();
                if (strongBinder15 != null) {
                    IInterface iInterfaceQueryLocalInterface15 = strongBinder15.queryLocalInterface("com.google.android.gms.measurement.api.internal.IEventHandlerProxy");
                    zzcgVar2 = iInterfaceQueryLocalInterface15 instanceof zzci ? (zzci) iInterfaceQueryLocalInterface15 : new zzcg(strongBinder15);
                }
                registerOnMeasurementEventListener(zzcgVar2);
                break;
            case 36:
                IBinder strongBinder16 = parcel.readStrongBinder();
                if (strongBinder16 != null) {
                    IInterface iInterfaceQueryLocalInterface16 = strongBinder16.queryLocalInterface("com.google.android.gms.measurement.api.internal.IEventHandlerProxy");
                    zzcgVar = iInterfaceQueryLocalInterface16 instanceof zzci ? (zzci) iInterfaceQueryLocalInterface16 : new zzcg(strongBinder16);
                }
                unregisterOnMeasurementEventListener(zzcgVar);
                break;
            case 37:
                initForTests(zzbo.zzf(parcel));
                break;
            case 38:
                IBinder strongBinder17 = parcel.readStrongBinder();
                if (strongBinder17 != null) {
                    IInterface iInterfaceQueryLocalInterface17 = strongBinder17.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar4 = iInterfaceQueryLocalInterface17 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface17 : new zzcd(strongBinder17);
                }
                getTestFlag(zzcdVar4, parcel.readInt());
                break;
            case 39:
                setDataCollectionEnabled(zzbo.zza(parcel));
                break;
            case 40:
                IBinder strongBinder18 = parcel.readStrongBinder();
                if (strongBinder18 != null) {
                    IInterface iInterfaceQueryLocalInterface18 = strongBinder18.queryLocalInterface("com.google.android.gms.measurement.api.internal.IBundleReceiver");
                    zzcdVar3 = iInterfaceQueryLocalInterface18 instanceof zzcf ? (zzcf) iInterfaceQueryLocalInterface18 : new zzcd(strongBinder18);
                }
                isDataCollectionEnabled(zzcdVar3);
                break;
            case 41:
            default:
                return false;
            case 42:
                setDefaultEventParameters((Bundle) zzbo.zzc(parcel, Bundle.CREATOR));
                break;
            case 43:
                clearMeasurementEnabled(parcel.readLong());
                break;
            case 44:
                setConsent((Bundle) zzbo.zzc(parcel, Bundle.CREATOR), parcel.readLong());
                break;
            case 45:
                setConsentThirdParty((Bundle) zzbo.zzc(parcel, Bundle.CREATOR), parcel.readLong());
                break;
        }
        parcel2.writeNoException();
        return true;
    }
}
