package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.GroundOverlay;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzm extends com.google.android.gms.maps.internal.zzy {
    final /* synthetic */ GoogleMap.OnGroundOverlayClickListener zza;

    zzm(GoogleMap googleMap, GoogleMap.OnGroundOverlayClickListener onGroundOverlayClickListener) {
        this.zza = onGroundOverlayClickListener;
    }

    @Override // com.google.android.gms.maps.internal.zzz
    public final void zzb(com.google.android.gms.internal.maps.zzo zzoVar) {
        this.zza.onGroundOverlayClick(new GroundOverlay(zzoVar));
    }
}
