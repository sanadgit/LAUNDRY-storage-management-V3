package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzv extends com.google.android.gms.maps.internal.zzs {
    final /* synthetic */ GoogleMap.OnCameraMoveListener zza;

    zzv(GoogleMap googleMap, GoogleMap.OnCameraMoveListener onCameraMoveListener) {
        this.zza = onCameraMoveListener;
    }

    @Override // com.google.android.gms.maps.internal.zzt
    public final void zzb() {
        this.zza.onCameraMove();
    }
}
