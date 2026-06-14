package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.LatLng;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzy extends com.google.android.gms.maps.internal.zzak {
    final /* synthetic */ GoogleMap.OnMapClickListener zza;

    zzy(GoogleMap googleMap, GoogleMap.OnMapClickListener onMapClickListener) {
        this.zza = onMapClickListener;
    }

    @Override // com.google.android.gms.maps.internal.zzal
    public final void zzb(LatLng latLng) {
        this.zza.onMapClick(latLng);
    }
}
