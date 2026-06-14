package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.CameraPosition;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzt extends com.google.android.gms.maps.internal.zzm {
    final /* synthetic */ GoogleMap.OnCameraChangeListener zza;

    zzt(GoogleMap googleMap, GoogleMap.OnCameraChangeListener onCameraChangeListener) {
        this.zza = onCameraChangeListener;
    }

    @Override // com.google.android.gms.maps.internal.zzn
    public final void zzb(CameraPosition cameraPosition) {
        this.zza.onCameraChange(cameraPosition);
    }
}
