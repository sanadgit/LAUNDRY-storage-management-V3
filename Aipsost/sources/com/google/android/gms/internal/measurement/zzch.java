package com.google.android.gms.internal.measurement;

import android.os.Bundle;
import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzch extends zzbn implements zzci {
    public zzch() {
        super("com.google.android.gms.measurement.api.internal.IEventHandlerProxy");
    }

    @Override // com.google.android.gms.internal.measurement.zzbn
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        switch (i) {
            case 1:
                zzd(parcel.readString(), parcel.readString(), (Bundle) zzbo.zzc(parcel, Bundle.CREATOR), parcel.readLong());
                parcel2.writeNoException();
                return true;
            case 2:
                int iZze = zze();
                parcel2.writeNoException();
                parcel2.writeInt(iZze);
                return true;
            default:
                return false;
        }
    }
}
