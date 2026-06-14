package com.google.android.gms.maps.internal;

import android.os.IBinder;
import android.os.IInterface;
import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzj extends com.google.android.gms.internal.maps.zzb implements ILocationSourceDelegate {
    public zzj() {
        super("com.google.android.gms.maps.internal.ILocationSourceDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzb
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        zzaj zzaiVar;
        switch (i) {
            case 1:
                IBinder strongBinder = parcel.readStrongBinder();
                if (strongBinder == null) {
                    zzaiVar = null;
                } else {
                    IInterface iInterfaceQueryLocalInterface = strongBinder.queryLocalInterface("com.google.android.gms.maps.internal.IOnLocationChangeListener");
                    zzaiVar = iInterfaceQueryLocalInterface instanceof zzaj ? (zzaj) iInterfaceQueryLocalInterface : new zzai(strongBinder);
                }
                activate(zzaiVar);
                break;
            case 2:
                deactivate();
                break;
            default:
                return false;
        }
        parcel2.writeNoException();
        return true;
    }
}
