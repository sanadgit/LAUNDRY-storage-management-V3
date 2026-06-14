package com.google.android.gms.internal.maps;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.maps.model.LatLng;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzv extends zza implements zzx {
    zzv(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.model.internal.IMarkerDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzA(float f, float f2) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        parcelZza.writeFloat(f2);
        zzc(24, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzB(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(25, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final float zzC() throws RemoteException {
        Parcel parcelZzH = zzH(26, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzD(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(27, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final float zzE() throws RemoteException {
        Parcel parcelZzH = zzH(28, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzF(IObjectWrapper iObjectWrapper) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, iObjectWrapper);
        zzc(29, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final IObjectWrapper zzG() throws RemoteException {
        Parcel parcelZzH = zzH(30, zza());
        IObjectWrapper iObjectWrapperAsInterface = IObjectWrapper.Stub.asInterface(parcelZzH.readStrongBinder());
        parcelZzH.recycle();
        return iObjectWrapperAsInterface;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzd() throws RemoteException {
        zzc(1, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final String zze() throws RemoteException {
        Parcel parcelZzH = zzH(2, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzf(LatLng latLng) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzd(parcelZza, latLng);
        zzc(3, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final LatLng zzg() throws RemoteException {
        Parcel parcelZzH = zzH(4, zza());
        LatLng latLng = (LatLng) zzc.zzc(parcelZzH, LatLng.CREATOR);
        parcelZzH.recycle();
        return latLng;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzh(String str) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        zzc(5, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final String zzi() throws RemoteException {
        Parcel parcelZzH = zzH(6, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzj(String str) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        zzc(7, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final String zzk() throws RemoteException {
        Parcel parcelZzH = zzH(8, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzl(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(9, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final boolean zzm() throws RemoteException {
        Parcel parcelZzH = zzH(10, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzn() throws RemoteException {
        zzc(11, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzo() throws RemoteException {
        zzc(12, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final boolean zzp() throws RemoteException {
        Parcel parcelZzH = zzH(13, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzq(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(14, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final boolean zzr() throws RemoteException {
        Parcel parcelZzH = zzH(15, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final boolean zzs(zzx zzxVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, zzxVar);
        Parcel parcelZzH = zzH(16, parcelZza);
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final int zzt() throws RemoteException {
        Parcel parcelZzH = zzH(17, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzu(IObjectWrapper iObjectWrapper) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, iObjectWrapper);
        zzc(18, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzv(float f, float f2) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        parcelZza.writeFloat(f2);
        zzc(19, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzw(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(20, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final boolean zzx() throws RemoteException {
        Parcel parcelZzH = zzH(21, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final void zzy(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(22, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzx
    public final float zzz() throws RemoteException {
        Parcel parcelZzH = zzH(23, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }
}
