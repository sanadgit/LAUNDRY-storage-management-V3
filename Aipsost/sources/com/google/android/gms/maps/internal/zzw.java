package com.google.android.gms.maps.internal;

import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzw extends com.google.android.gms.internal.maps.zzb implements zzx {
    public zzw() {
        super("com.google.android.gms.maps.internal.IOnCircleClickListener");
    }

    @Override // com.google.android.gms.internal.maps.zzb
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        if (i != 1) {
            return false;
        }
        zzb(com.google.android.gms.internal.maps.zzk.zzb(parcel.readStrongBinder()));
        parcel2.writeNoException();
        return true;
    }
}
