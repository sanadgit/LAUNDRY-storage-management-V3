package com.google.android.gms.maps.internal;

import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzbg extends com.google.android.gms.internal.maps.zzb implements zzbh {
    public zzbg() {
        super("com.google.android.gms.maps.internal.IOnPolylineClickListener");
    }

    @Override // com.google.android.gms.internal.maps.zzb
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        if (i != 1) {
            return false;
        }
        zzb(com.google.android.gms.internal.maps.zzac.zzb(parcel.readStrongBinder()));
        parcel2.writeNoException();
        return true;
    }
}
