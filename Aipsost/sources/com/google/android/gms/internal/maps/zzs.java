package com.google.android.gms.internal.maps;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzs extends zza implements zzu {
    zzs(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.model.internal.IIndoorLevelDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzu
    public final String zzd() throws RemoteException {
        Parcel parcelZzH = zzH(1, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzu
    public final String zze() throws RemoteException {
        Parcel parcelZzH = zzH(2, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzu
    public final void zzf() throws RemoteException {
        zzc(3, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzu
    public final boolean zzg(zzu zzuVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, zzuVar);
        Parcel parcelZzH = zzH(4, parcelZza);
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzu
    public final int zzh() throws RemoteException {
        Parcel parcelZzH = zzH(5, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }
}
