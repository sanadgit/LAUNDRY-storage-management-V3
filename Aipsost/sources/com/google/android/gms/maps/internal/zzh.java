package com.google.android.gms.maps.internal;

import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzh extends com.google.android.gms.internal.maps.zzb implements zzi {
    public zzh() {
        super("com.google.android.gms.maps.internal.IInfoWindowAdapter");
    }

    @Override // com.google.android.gms.internal.maps.zzb
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        switch (i) {
            case 1:
                IObjectWrapper iObjectWrapperZzb = zzb(com.google.android.gms.internal.maps.zzw.zzb(parcel.readStrongBinder()));
                parcel2.writeNoException();
                com.google.android.gms.internal.maps.zzc.zzf(parcel2, iObjectWrapperZzb);
                return true;
            case 2:
                IObjectWrapper iObjectWrapperZzc = zzc(com.google.android.gms.internal.maps.zzw.zzb(parcel.readStrongBinder()));
                parcel2.writeNoException();
                com.google.android.gms.internal.maps.zzc.zzf(parcel2, iObjectWrapperZzc);
                return true;
            default:
                return false;
        }
    }
}
