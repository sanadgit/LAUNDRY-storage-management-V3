package com.google.android.gms.maps;

import android.os.RemoteException;
import com.google.android.gms.maps.GoogleMap;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzh extends com.google.android.gms.maps.internal.zzaw {
    final /* synthetic */ GoogleMap.OnMyLocationButtonClickListener zza;

    zzh(GoogleMap googleMap, GoogleMap.OnMyLocationButtonClickListener onMyLocationButtonClickListener) {
        this.zza = onMyLocationButtonClickListener;
    }

    @Override // com.google.android.gms.maps.internal.zzax
    public final boolean zzb() throws RemoteException {
        return this.zza.onMyLocationButtonClick();
    }
}
