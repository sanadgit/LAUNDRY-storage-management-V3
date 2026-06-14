package com.google.android.gms.maps.internal;

import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzay extends com.google.android.gms.internal.maps.zzb implements zzaz {
    public zzay() {
        super("com.google.android.gms.maps.internal.IOnMyLocationChangeListener");
    }

    @Override // com.google.android.gms.internal.maps.zzb
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        if (i != 1) {
            return false;
        }
        zzb(IObjectWrapper.Stub.asInterface(parcel.readStrongBinder()));
        parcel2.writeNoException();
        return true;
    }
}
