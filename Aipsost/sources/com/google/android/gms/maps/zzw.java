package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzw extends com.google.android.gms.maps.internal.zzq {
    final /* synthetic */ GoogleMap.OnCameraMoveCanceledListener zza;

    zzw(GoogleMap googleMap, GoogleMap.OnCameraMoveCanceledListener onCameraMoveCanceledListener) {
        this.zza = onCameraMoveCanceledListener;
    }

    @Override // com.google.android.gms.maps.internal.zzr
    public final void zzb() {
        this.zza.onCameraMoveCanceled();
    }
}
