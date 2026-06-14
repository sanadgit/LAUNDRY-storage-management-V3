package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.internal.zzbg;
import com.google.android.gms.maps.model.Polyline;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzp extends zzbg {
    final /* synthetic */ GoogleMap.OnPolylineClickListener zza;

    zzp(GoogleMap googleMap, GoogleMap.OnPolylineClickListener onPolylineClickListener) {
        this.zza = onPolylineClickListener;
    }

    @Override // com.google.android.gms.maps.internal.zzbh
    public final void zzb(com.google.android.gms.internal.maps.zzad zzadVar) {
        this.zza.onPolylineClick(new Polyline(zzadVar));
    }
}
