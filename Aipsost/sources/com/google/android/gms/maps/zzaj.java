package com.google.android.gms.maps;

import com.google.android.gms.maps.StreetViewPanorama;
import com.google.android.gms.maps.internal.zzbi;
import com.google.android.gms.maps.model.StreetViewPanoramaCamera;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzaj extends zzbi {
    final /* synthetic */ StreetViewPanorama.OnStreetViewPanoramaCameraChangeListener zza;

    zzaj(StreetViewPanorama streetViewPanorama, StreetViewPanorama.OnStreetViewPanoramaCameraChangeListener onStreetViewPanoramaCameraChangeListener) {
        this.zza = onStreetViewPanoramaCameraChangeListener;
    }

    @Override // com.google.android.gms.maps.internal.zzbj
    public final void zzb(StreetViewPanoramaCamera streetViewPanoramaCamera) {
        this.zza.onStreetViewPanoramaCameraChange(streetViewPanoramaCamera);
    }
}
