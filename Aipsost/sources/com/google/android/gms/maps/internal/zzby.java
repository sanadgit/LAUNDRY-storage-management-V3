package com.google.android.gms.maps.internal;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzby extends com.google.android.gms.internal.maps.zza implements IUiSettingsDelegate {
    zzby(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.internal.IUiSettingsDelegate");
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isCompassEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(10, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isIndoorLevelPickerEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(17, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isMapToolbarEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(19, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isMyLocationButtonEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(11, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isRotateGesturesEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(15, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isScrollGesturesEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(12, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isScrollGesturesEnabledDuringRotateOrZoom() throws RemoteException {
        Parcel parcelZzH = zzH(21, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isTiltGesturesEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(14, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isZoomControlsEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(9, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final boolean isZoomGesturesEnabled() throws RemoteException {
        Parcel parcelZzH = zzH(13, zza());
        boolean zZza = com.google.android.gms.internal.maps.zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setAllGesturesEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(8, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setCompassEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(2, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setIndoorLevelPickerEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(16, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setMapToolbarEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(18, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setMyLocationButtonEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(3, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setRotateGesturesEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(7, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setScrollGesturesEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(4, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setScrollGesturesEnabledDuringRotateOrZoom(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(20, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setTiltGesturesEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(6, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setZoomControlsEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(1, parcelZza);
    }

    @Override // com.google.android.gms.maps.internal.IUiSettingsDelegate
    public final void setZoomGesturesEnabled(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.maps.zzc.zzb(parcelZza, z);
        zzc(5, parcelZza);
    }
}
