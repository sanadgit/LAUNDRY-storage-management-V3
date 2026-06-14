package com.google.android.gms.internal.maps;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.maps.model.Tile;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzah extends zza implements zzaj {
    zzah(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.maps.model.internal.ITileProviderDelegate");
    }

    @Override // com.google.android.gms.internal.maps.zzaj
    public final Tile zzb(int i, int i2, int i3) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeInt(i);
        parcelZza.writeInt(i2);
        parcelZza.writeInt(i3);
        Parcel parcelZzH = zzH(1, parcelZza);
        Tile tile = (Tile) zzc.zzc(parcelZzH, Tile.CREATOR);
        parcelZzH.recycle();
        return tile;
    }
}
