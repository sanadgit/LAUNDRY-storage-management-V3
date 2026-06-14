package com.google.android.gms.maps.internal;

import android.os.Bundle;
import android.os.IBinder;
import android.os.IInterface;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.maps.GoogleMapOptions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzk extends com.google.android.gms.internal.maps.zza implements IMapFragmentDelegate {
    zzk(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.internal.IMapFragmentDelegate");
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final IGoogleMapDelegate getMap() throws RemoteException {
        IGoogleMapDelegate zzgVar;
        Parcel parcelZzH = zzH(1, zza());
        IBinder strongBinder = parcelZzH.readStrongBinder();
        if (strongBinder == null) {
            zzgVar = null;
        } else {
            IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.IGoogleMapDelegate");
            zzgVar = iInterfaceQueryLocalInterface instanceof IGoogleMapDelegate ? (IGoogleMapDelegate) iInterfaceQueryLocalInterface : new zzg(strongBinder);
        }
        parcelZzH.recycle();
        return zzgVar;
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void getMapAsync(zzar zzarVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, zzarVar);
        zzc(12, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final boolean isReady() throws RemoteException {
        Parcel parcelZzH = zzH(11, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onCreate(Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, bundle);
        zzc(3, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final IObjectWrapper onCreateView(IObjectWrapper iObjectWrapper, IObjectWrapper iObjectWrapper2, Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, iObjectWrapper);
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, iObjectWrapper2);
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, bundle);
        Parcel parcelZzH = zzH(4, parcelZza);
        IObjectWrapper iObjectWrapperAsInterface = IObjectWrapper.Stub.asInterface(parcelZzH.readStrongBinder());
        parcelZzH.recycle();
        return iObjectWrapperAsInterface;
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onDestroy() throws RemoteException {
        zzc(8, zza());
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onDestroyView() throws RemoteException {
        zzc(7, zza());
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onEnterAmbient(Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, bundle);
        zzc(13, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onExitAmbient() throws RemoteException {
        zzc(14, zza());
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onInflate(IObjectWrapper iObjectWrapper, GoogleMapOptions googleMapOptions, Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, iObjectWrapper);
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, googleMapOptions);
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, bundle);
        zzc(2, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onLowMemory() throws RemoteException {
        zzc(9, zza());
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onPause() throws RemoteException {
        zzc(6, zza());
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onResume() throws RemoteException {
        zzc(5, zza());
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onSaveInstanceState(Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, bundle);
        Parcel parcelZzH = zzH(10, parcelZza);
        if (parcelZzH.readInt() != 0) {
            bundle.readFromParcel(parcelZzH);
        }
        parcelZzH.recycle();
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onStart() throws RemoteException {
        zzc(15, zza());
    }

    @Override // com.google.android.gms.maps.internal.IMapFragmentDelegate
    public final void onStop() throws RemoteException {
        zzc(16, zza());
    }
}
