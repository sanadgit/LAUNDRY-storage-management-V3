package com.google.android.gms.internal.maps;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.PatternItem;
import java.util.ArrayList;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzj extends zza implements zzl {
    zzj(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.model.internal.ICircleDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final IObjectWrapper zzA() throws RemoteException {
        Parcel parcelZzH = zzH(24, zza());
        IObjectWrapper iObjectWrapperAsInterface = IObjectWrapper.Stub.asInterface(parcelZzH.readStrongBinder());
        parcelZzH.recycle();
        return iObjectWrapperAsInterface;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzd() throws RemoteException {
        zzc(1, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final String zze() throws RemoteException {
        Parcel parcelZzH = zzH(2, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzf(LatLng latLng) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzd(parcelZza, latLng);
        zzc(3, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final LatLng zzg() throws RemoteException {
        Parcel parcelZzH = zzH(4, zza());
        LatLng latLng = (LatLng) zzc.zzc(parcelZzH, LatLng.CREATOR);
        parcelZzH.recycle();
        return latLng;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzh(double d) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeDouble(d);
        zzc(5, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final double zzi() throws RemoteException {
        Parcel parcelZzH = zzH(6, zza());
        double d = parcelZzH.readDouble();
        parcelZzH.recycle();
        return d;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzj(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(7, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final float zzk() throws RemoteException {
        Parcel parcelZzH = zzH(8, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzl(int i) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(i);
        zzc(9, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final int zzm() throws RemoteException {
        Parcel parcelZzH = zzH(10, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzn(int i) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(i);
        zzc(11, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final int zzo() throws RemoteException {
        Parcel parcelZzH = zzH(12, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzp(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(13, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final float zzq() throws RemoteException {
        Parcel parcelZzH = zzH(14, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzr(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(15, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final boolean zzs() throws RemoteException {
        Parcel parcelZzH = zzH(16, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final boolean zzt(zzl zzlVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, zzlVar);
        Parcel parcelZzH = zzH(17, parcelZza);
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final int zzu() throws RemoteException {
        Parcel parcelZzH = zzH(18, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzv(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(19, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final boolean zzw() throws RemoteException {
        Parcel parcelZzH = zzH(20, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzx(List<PatternItem> list) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeTypedList(list);
        zzc(21, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final List<PatternItem> zzy() throws RemoteException {
        Parcel parcelZzH = zzH(22, zza());
        ArrayList arrayListCreateTypedArrayList = parcelZzH.createTypedArrayList(PatternItem.CREATOR);
        parcelZzH.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.internal.maps.zzl
    public final void zzz(IObjectWrapper iObjectWrapper) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, iObjectWrapper);
        zzc(23, parcelZza);
    }
}
