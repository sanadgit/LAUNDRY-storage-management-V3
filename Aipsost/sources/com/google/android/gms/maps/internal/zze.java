package com.google.android.gms.maps.internal;

import android.os.IBinder;
import android.os.IInterface;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.maps.GoogleMapOptions;
import com.google.android.gms.maps.StreetViewPanoramaOptions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zze extends com.google.android.gms.internal.maps.zza implements zzf {
    zze(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.internal.ICreator");
    }

    @Override // com.google.android.gms.maps.internal.zzf
    public final IMapFragmentDelegate zzd(IObjectWrapper iObjectWrapper) throws RemoteException {
        IMapFragmentDelegate zzkVar;
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, iObjectWrapper);
        Parcel parcelZzH = zzH(2, parcelZza);
        IBinder strongBinder = parcelZzH.readStrongBinder();
        if (strongBinder == null) {
            zzkVar = null;
        } else {
            IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.IMapFragmentDelegate");
            zzkVar = iInterfaceQueryLocalInterface instanceof IMapFragmentDelegate ? (IMapFragmentDelegate) iInterfaceQueryLocalInterface : new zzk(strongBinder);
        }
        parcelZzH.recycle();
        return zzkVar;
    }

    @Override // com.google.android.gms.maps.internal.zzf
    public final IMapViewDelegate zze(IObjectWrapper iObjectWrapper, GoogleMapOptions googleMapOptions) throws RemoteException {
        IMapViewDelegate zzlVar;
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, iObjectWrapper);
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, googleMapOptions);
        Parcel parcelZzH = zzH(3, parcelZza);
        IBinder strongBinder = parcelZzH.readStrongBinder();
        if (strongBinder == null) {
            zzlVar = null;
        } else {
            IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.IMapViewDelegate");
            zzlVar = iInterfaceQueryLocalInterface instanceof IMapViewDelegate ? (IMapViewDelegate) iInterfaceQueryLocalInterface : new zzl(strongBinder);
        }
        parcelZzH.recycle();
        return zzlVar;
    }

    @Override // com.google.android.gms.maps.internal.zzf
    public final ICameraUpdateFactoryDelegate zzf() throws RemoteException {
        ICameraUpdateFactoryDelegate zzbVar;
        Parcel parcelZzH = zzH(4, zza());
        IBinder strongBinder = parcelZzH.readStrongBinder();
        if (strongBinder == null) {
            zzbVar = null;
        } else {
            IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.ICameraUpdateFactoryDelegate");
            zzbVar = iInterfaceQueryLocalInterface instanceof ICameraUpdateFactoryDelegate ? (ICameraUpdateFactoryDelegate) iInterfaceQueryLocalInterface : new zzb(strongBinder);
        }
        parcelZzH.recycle();
        return zzbVar;
    }

    @Override // com.google.android.gms.maps.internal.zzf
    public final com.google.android.gms.internal.maps.zzi zzg() throws RemoteException {
        Parcel parcelZzH = zzH(5, zza());
        com.google.android.gms.internal.maps.zzi zziVarZzb = com.google.android.gms.internal.maps.zzh.zzb(parcelZzH.readStrongBinder());
        parcelZzH.recycle();
        return zziVarZzb;
    }

    @Override // com.google.android.gms.maps.internal.zzf
    public final void zzh(IObjectWrapper iObjectWrapper, int i) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, iObjectWrapper);
        parcelZza.writeInt(i);
        zzc(6, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.zzf
    public final IStreetViewPanoramaViewDelegate zzi(IObjectWrapper iObjectWrapper, StreetViewPanoramaOptions streetViewPanoramaOptions) throws RemoteException {
        IStreetViewPanoramaViewDelegate zzbxVar;
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, iObjectWrapper);
        com.google.android.gms.internal.maps.zzc.zzd(parcelZza, streetViewPanoramaOptions);
        Parcel parcelZzH = zzH(7, parcelZza);
        IBinder strongBinder = parcelZzH.readStrongBinder();
        if (strongBinder == null) {
            zzbxVar = null;
        } else {
            IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.IStreetViewPanoramaViewDelegate");
            zzbxVar = iInterfaceQueryLocalInterface instanceof IStreetViewPanoramaViewDelegate ? (IStreetViewPanoramaViewDelegate) iInterfaceQueryLocalInterface : new zzbx(strongBinder);
        }
        parcelZzH.recycle();
        return zzbxVar;
    }

    @Override // com.google.android.gms.maps.internal.zzf
    public final IStreetViewPanoramaFragmentDelegate zzj(IObjectWrapper iObjectWrapper) throws RemoteException {
        IStreetViewPanoramaFragmentDelegate zzbwVar;
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzf(parcelZza, iObjectWrapper);
        Parcel parcelZzH = zzH(8, parcelZza);
        IBinder strongBinder = parcelZzH.readStrongBinder();
        if (strongBinder == null) {
            zzbwVar = null;
        } else {
            IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.IStreetViewPanoramaFragmentDelegate");
            zzbwVar = iInterfaceQueryLocalInterface instanceof IStreetViewPanoramaFragmentDelegate ? (IStreetViewPanoramaFragmentDelegate) iInterfaceQueryLocalInterface : new zzbw(strongBinder);
        }
        parcelZzH.recycle();
        return zzbwVar;
    }
}
