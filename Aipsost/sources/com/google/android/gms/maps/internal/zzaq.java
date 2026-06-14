package com.google.android.gms.maps.internal;

import android.os.IBinder;
import android.os.IInterface;
import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzaq extends com.google.android.gms.internal.maps.zzb implements zzar {
    public zzaq() {
        super("com.google.android.gms.maps.internal.IOnMapReadyCallback");
    }

    @Override // com.google.android.gms.internal.maps.zzb
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        IGoogleMapDelegate zzgVar;
        if (i != 1) {
            return false;
        }
        IBinder strongBinder = parcel.readStrongBinder();
        if (strongBinder == null) {
            zzgVar = null;
        } else {
            IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.IGoogleMapDelegate");
            zzgVar = iInterfaceQueryLocalInterface instanceof IGoogleMapDelegate ? (IGoogleMapDelegate) iInterfaceQueryLocalInterface : new zzg(strongBinder);
        }
        zzb(zzgVar);
        parcel2.writeNoException();
        return true;
    }
}
