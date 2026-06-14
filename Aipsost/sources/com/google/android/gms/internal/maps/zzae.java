package com.google.android.gms.internal.maps;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzae extends zza implements zzag {
    zzae(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.model.internal.ITileOverlayDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final void zzd() throws RemoteException {
        zzc(1, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final void zze() throws RemoteException {
        zzc(2, zza());
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final String zzf() throws RemoteException {
        Parcel parcelZzH = zzH(3, zza());
        String string = parcelZzH.readString();
        parcelZzH.recycle();
        return string;
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final void zzg(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(4, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final float zzh() throws RemoteException {
        Parcel parcelZzH = zzH(5, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final void zzi(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(6, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final boolean zzj() throws RemoteException {
        Parcel parcelZzH = zzH(7, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final boolean zzk(zzag zzagVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzf(parcelZza, zzagVar);
        Parcel parcelZzH = zzH(8, parcelZza);
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final int zzl() throws RemoteException {
        Parcel parcelZzH = zzH(9, zza());
        int i = parcelZzH.readInt();
        parcelZzH.recycle();
        return i;
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final void zzm(boolean z) throws RemoteException {
        Parcel parcelZza = zza();
        zzc.zzb(parcelZza, z);
        zzc(10, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final boolean zzn() throws RemoteException {
        Parcel parcelZzH = zzH(11, zza());
        boolean zZza = zzc.zza(parcelZzH);
        parcelZzH.recycle();
        return zZza;
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final void zzo(float f) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeFloat(f);
        zzc(12, parcelZza);
    }

    @Override // com.google.android.gms.internal.maps.zzag
    public final float zzp() throws RemoteException {
        Parcel parcelZzH = zzH(13, zza());
        float f = parcelZzH.readFloat();
        parcelZzH.recycle();
        return f;
    }
}
