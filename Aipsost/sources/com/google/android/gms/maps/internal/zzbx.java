package com.google.android.gms.maps.internal;

import android.os.Bundle;
import android.os.IBinder;
import android.os.IInterface;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbx extends com.google.android.gms.internal.maps.zza implements IStreetViewPanoramaViewDelegate {
    zzbx(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate");
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final IStreetViewPanoramaDelegate getStreetViewPanorama() throws RemoteException {
        IStreetViewPanoramaDelegate zzbvVar;
        Parcel parcelZzH = zzH(1, zza());
        IBinder strongBinder = parcelZzH.readStrongBinder();
        if (strongBinder == null) {
            zzbvVar = null;
        } else {
            IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.IStreetViewPanoramaDelegate");
            zzbvVar = iInterfaceQueryLocalInterface instanceof IStreetViewPanoramaDelegate ? (IStreetViewPanoramaDelegate) iInterfaceQueryLocalInterface : new zzbv(strongBinder);
        }
        parcelZzH.recycle();
        return zzbvVar;
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void getStreetViewPanoramaAsync(zzbr zzbrVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, zzbrVar);
        zzc(9, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final IObjectWrapper getView() throws RemoteException {
        Parcel parcelZzH = zzH(8, zza());
        IObjectWrapper iObjectWrapperAsInterface = IObjectWrapper.Stub.asInterface(parcelZzH.readStrongBinder());
        parcelZzH.recycle();
        return iObjectWrapperAsInterface;
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void onCreate(Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, bundle);
        zzc(2, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void onDestroy() throws RemoteException {
        zzc(5, zza());
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void onLowMemory() throws RemoteException {
        zzc(6, zza());
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void onPause() throws RemoteException {
        zzc(4, zza());
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void onResume() throws RemoteException {
        zzc(3, zza());
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void onSaveInstanceState(Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, bundle);
        Parcel parcelZzH = zzH(7, parcelZza);
        if (parcelZzH.readInt() != 0) {
            bundle.readFromParcel(parcelZzH);
        }
        parcelZzH.recycle();
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void onStart() throws RemoteException {
        zzc(10, zza());
    }

    @Override // com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate
    public final void onStop() throws RemoteException {
        zzc(11, zza());
    }
}
