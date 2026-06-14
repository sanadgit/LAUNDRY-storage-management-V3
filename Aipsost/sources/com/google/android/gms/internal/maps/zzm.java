package com.google.android.gms.internal.maps;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzm extends zza implements zzo {
    zzm(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.model.internal.IGroundOverlayDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzA(IObjectWrapper iObjectWrapper) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, iObjectWrapper);
        zzc(24, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final IObjectWrapper zzB() throws RemoteException {
        Parcel parcelZzH = zzH(25, zza());
        IObjectWrapper iObjectWrapperAsInterface = IObjectWrapper.Stub.asInterface(parcelZzH.readStrongBinder());
        parcelZzH.recycle();
        return iObjectWrapperAsInterface;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzd() throws RemoteException {
        zzc(1, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final String zze() throws RemoteException {
        Parcel parcelZzH = zzH(2, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzf(LatLng latLng) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzd(parcelZza, latLng);
        zzc(3, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final LatLng zzg() throws RemoteException {
        Parcel parcelZzH = zzH(4, zza());
        LatLng latLng = (LatLng) zzc.zzc(parcelZzH, LatLng.CREATOR);
        parcelZzH.recycle();
        return latLng;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzh(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(5, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzi(float f, float f2) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        parcelZza.writeFloat(f2);
        zzc(6, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final float zzj() throws RemoteException {
        Parcel parcelZzH = zzH(7, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final float zzk() throws RemoteException {
        Parcel parcelZzH = zzH(8, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzl(LatLngBounds latLngBounds) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzd(parcelZza, latLngBounds);
        zzc(9, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final LatLngBounds zzm() throws RemoteException {
        Parcel parcelZzH = zzH(10, zza());
        LatLngBounds latLngBounds = (LatLngBounds) zzc.zzc(parcelZzH, LatLngBounds.CREATOR);
        parcelZzH.recycle();
        return latLngBounds;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzn(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(11, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final float zzo() throws RemoteException {
        Parcel parcelZzH = zzH(12, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzp(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(13, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final float zzq() throws RemoteException {
        Parcel parcelZzH = zzH(14, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzr(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(15, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final boolean zzs() throws RemoteException {
        Parcel parcelZzH = zzH(16, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzt(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(17, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final float zzu() throws RemoteException {
        Parcel parcelZzH = zzH(18, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final boolean zzv(zzo zzoVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, zzoVar);
        Parcel parcelZzH = zzH(19, parcelZza);
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final int zzw() throws RemoteException {
        Parcel parcelZzH = zzH(20, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzx(IObjectWrapper iObjectWrapper) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, iObjectWrapper);
        zzc(21, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final void zzy(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(22, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzo
    public final boolean zzz() throws RemoteException {
        Parcel parcelZzH = zzH(23, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }
}
