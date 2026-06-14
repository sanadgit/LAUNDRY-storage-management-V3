package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;
import java.util.ArrayList;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzeb extends com.google.android.gms.internal.measurement.zzbm implements zzed {
    zzeb(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.measurement.internal.IMeasurementService");
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzd(zzas zzasVar, zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzasVar);
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        zzc(1, parcelZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zze(zzkq zzkqVar, zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzkqVar);
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        zzc(2, parcelZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzf(zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        zzc(4, parcelZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzg(zzas zzasVar, String str, String str2) throws RemoteException {
        throw null;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzh(zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        zzc(6, parcelZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzkq> zzi(zzp zzpVar, boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        com.google.android.gms.internal.measurement.zzbo.zzb(parcelZza, z);
        Parcel parcelZzC = zzC(7, parcelZza);
        ArrayList arrayListCreateTypedArrayList = parcelZzC.createTypedArrayList(zzkq.CREATOR);
        parcelZzC.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final byte[] zzj(zzas zzasVar, String str) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzasVar);
        parcelZza.writeString(str);
        Parcel parcelZzC = zzC(9, parcelZza);
        byte[] bArrCreateByteArray = parcelZzC.createByteArray();
        parcelZzC.recycle();
        return bArrCreateByteArray;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzk(long j, String str, String str2, String str3) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeLong(j);
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        parcelZza.writeString(str3);
        zzc(10, parcelZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final String zzl(zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        Parcel parcelZzC = zzC(11, parcelZza);
        String string = parcelZzC.readString();
        parcelZzC.recycle();
        return string;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzm(zzaa zzaaVar, zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzaaVar);
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        zzc(12, parcelZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzn(zzaa zzaaVar) throws RemoteException {
        throw null;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzkq> zzo(String str, String str2, boolean z, zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        com.google.android.gms.internal.measurement.zzbo.zzb(parcelZza, z);
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        Parcel parcelZzC = zzC(14, parcelZza);
        ArrayList arrayListCreateTypedArrayList = parcelZzC.createTypedArrayList(zzkq.CREATOR);
        parcelZzC.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzkq> zzp(String str, String str2, String str3, boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(null);
        parcelZza.writeString(str2);
        parcelZza.writeString(str3);
        com.google.android.gms.internal.measurement.zzbo.zzb(parcelZza, z);
        Parcel parcelZzC = zzC(15, parcelZza);
        ArrayList arrayListCreateTypedArrayList = parcelZzC.createTypedArrayList(zzkq.CREATOR);
        parcelZzC.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzaa> zzq(String str, String str2, zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        parcelZza.writeString(str2);
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        Parcel parcelZzC = zzC(16, parcelZza);
        ArrayList arrayListCreateTypedArrayList = parcelZzC.createTypedArrayList(zzaa.CREATOR);
        parcelZzC.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzaa> zzr(String str, String str2, String str3) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(null);
        parcelZza.writeString(str2);
        parcelZza.writeString(str3);
        Parcel parcelZzC = zzC(17, parcelZza);
        ArrayList arrayListCreateTypedArrayList = parcelZzC.createTypedArrayList(zzaa.CREATOR);
        parcelZzC.recycle();
        return arrayListCreateTypedArrayList;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzs(zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        zzc(18, parcelZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzt(Bundle bundle, zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, bundle);
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        zzc(19, parcelZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzu(zzp zzpVar) throws RemoteException {
        Parcel parcelZza = zza();
        com.google.android.gms.internal.measurement.zzbo.zzd(parcelZza, zzpVar);
        zzc(20, parcelZza);
    }
}
