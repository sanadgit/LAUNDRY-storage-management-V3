package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.Marker;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzd extends com.google.android.gms.maps.internal.zzag {
    final /* synthetic */ GoogleMap.OnInfoWindowLongClickListener zza;

    zzd(GoogleMap googleMap, GoogleMap.OnInfoWindowLongClickListener onInfoWindowLongClickListener) {
        this.zza = onInfoWindowLongClickListener;
    }

    @Override // com.google.android.gms.maps.internal.zzah
    public final void zzb(com.google.android.gms.internal.maps.zzx zzxVar) {
        this.zza.onInfoWindowLongClick(new Marker(zzxVar));
    }
}
