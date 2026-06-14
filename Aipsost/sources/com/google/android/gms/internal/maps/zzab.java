package com.google.android.gms.internal.maps;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.maps.model.Cap;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.PatternItem;
import java.util.ArrayList;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzab extends zza implements zzad {
    zzab(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.model.internal.IPolylineDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final int zzA() throws RemoteException {
        Parcel parcelZzH = zzH(24, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzB(List<PatternItem> list) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeTypedList(list);
        zzc(25, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final List<PatternItem> zzC() throws RemoteException {
        Parcel parcelZzH = zzH(26, zza());
        ArrayList arrayListCreateTypedArrayList = parcelZzH.createTypedArrayList(PatternItem.CREATOR);
        parcelZzH.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzD(IObjectWrapper iObjectWrapper) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, iObjectWrapper);
        zzc(27, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final IObjectWrapper zzE() throws RemoteException {
        Parcel parcelZzH = zzH(28, zza());
        IObjectWrapper iObjectWrapperAsInterface = IObjectWrapper.Stub.asInterface(parcelZzH.readStrongBinder());
        parcelZzH.recycle();
        return iObjectWrapperAsInterface;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzd() throws RemoteException {
        zzc(1, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final String zze() throws RemoteException {
        Parcel parcelZzH = zzH(2, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzf(List<LatLng> list) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeTypedList(list);
        zzc(3, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final List<LatLng> zzg() throws RemoteException {
        Parcel parcelZzH = zzH(4, zza());
        ArrayList arrayListCreateTypedArrayList = parcelZzH.createTypedArrayList(LatLng.CREATOR);
        parcelZzH.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzh(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(5, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final float zzi() throws RemoteException {
        Parcel parcelZzH = zzH(6, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzj(int i) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(i);
        zzc(7, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final int zzk() throws RemoteException {
        Parcel parcelZzH = zzH(8, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzl(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(9, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final float zzm() throws RemoteException {
        Parcel parcelZzH = zzH(10, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzn(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(11, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final boolean zzo() throws RemoteException {
        Parcel parcelZzH = zzH(12, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzp(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(13, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final boolean zzq() throws RemoteException {
        Parcel parcelZzH = zzH(14, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final boolean zzr(zzad zzadVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, zzadVar);
        Parcel parcelZzH = zzH(15, parcelZza);
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final int zzs() throws RemoteException {
        Parcel parcelZzH = zzH(16, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzt(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(17, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final boolean zzu() throws RemoteException {
        Parcel parcelZzH = zzH(18, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzv(Cap cap) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzd(parcelZza, cap);
        zzc(19, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final Cap zzw() throws RemoteException {
        Parcel parcelZzH = zzH(20, zza());
        Cap cap = (Cap) zzc.zzc(parcelZzH, Cap.CREATOR);
        parcelZzH.recycle();
        return cap;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzx(Cap cap) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzd(parcelZza, cap);
        zzc(21, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final Cap zzy() throws RemoteException {
        Parcel parcelZzH = zzH(22, zza());
        Cap cap = (Cap) zzc.zzc(parcelZzH, Cap.CREATOR);
        parcelZzH.recycle();
        return cap;
    }

    @Override // com.google.android.gms.internal.maps.zzad
    public final void zzz(int i) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(i);
        zzc(23, parcelZza);
    }
}
