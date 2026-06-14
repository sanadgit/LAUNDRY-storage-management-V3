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
public final class zzy extends zza implements zzaa {
    zzy(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.model.internal.IPolygonDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final int zzA() throws RemoteException {
        Parcel parcelZzH = zzH(24, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzB(List<PatternItem> list) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeTypedList(list);
        zzc(25, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final List<PatternItem> zzC() throws RemoteException {
        Parcel parcelZzH = zzH(26, zza());
        ArrayList arrayListCreateTypedArrayList = parcelZzH.createTypedArrayList(PatternItem.CREATOR);
        parcelZzH.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzD(IObjectWrapper iObjectWrapper) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, iObjectWrapper);
        zzc(27, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final IObjectWrapper zzE() throws RemoteException {
        Parcel parcelZzH = zzH(28, zza());
        IObjectWrapper iObjectWrapperAsInterface = IObjectWrapper.Stub.asInterface(parcelZzH.readStrongBinder());
        parcelZzH.recycle();
        return iObjectWrapperAsInterface;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzd() throws RemoteException {
        zzc(1, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final String zze() throws RemoteException {
        Parcel parcelZzH = zzH(2, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzf(List<LatLng> list) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeTypedList(list);
        zzc(3, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final List<LatLng> zzg() throws RemoteException {
        Parcel parcelZzH = zzH(4, zza());
        ArrayList arrayListCreateTypedArrayList = parcelZzH.createTypedArrayList(LatLng.CREATOR);
        parcelZzH.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzh(List list) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeList(list);
        zzc(5, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final List zzi() throws RemoteException {
        Parcel parcelZzH = zzH(6, zza());
        ArrayList arrayListZzg = zzc.zzg(parcelZzH);
        parcelZzH.recycle();
        return arrayListZzg;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzj(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(7, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final float zzk() throws RemoteException {
        Parcel parcelZzH = zzH(8, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzl(int i) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(i);
        zzc(9, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final int zzm() throws RemoteException {
        Parcel parcelZzH = zzH(10, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzn(int i) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(i);
        zzc(11, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final int zzo() throws RemoteException {
        Parcel parcelZzH = zzH(12, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzp(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(13, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final float zzq() throws RemoteException {
        Parcel parcelZzH = zzH(14, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzr(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(15, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final boolean zzs() throws RemoteException {
        Parcel parcelZzH = zzH(16, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzt(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(17, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final boolean zzu() throws RemoteException {
        Parcel parcelZzH = zzH(18, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final boolean zzv(zzaa zzaaVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, zzaaVar);
        Parcel parcelZzH = zzH(19, parcelZza);
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final int zzw() throws RemoteException {
        Parcel parcelZzH = zzH(20, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzx(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(21, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final boolean zzy() throws RemoteException {
        Parcel parcelZzH = zzH(22, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzaa
    public final void zzz(int i) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(i);
        zzc(23, parcelZza);
    }
}
