package com.google.android.gms.maps;

import android.os.RemoteException;
import com.google.android.gms.maps.internal.IGoogleMapDelegate;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzaf extends com.google.android.gms.maps.internal.zzaq {
    final /* synthetic */ OnMapReadyCallback zza;

    zzaf(zzag zzagVar, OnMapReadyCallback onMapReadyCallback) {
        this.zza = onMapReadyCallback;
    }

    @Override // com.google.android.gms.maps.internal.zzar
    public final void zzb(IGoogleMapDelegate iGoogleMapDelegate) throws RemoteException {
        this.zza.onMapReady(new GoogleMap(iGoogleMapDelegate));
    }
}
