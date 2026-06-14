package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.internal.zzbe;
import com.google.android.gms.maps.model.Polygon;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzo extends zzbe {
    final /* synthetic */ GoogleMap.OnPolygonClickListener zza;

    zzo(GoogleMap googleMap, GoogleMap.OnPolygonClickListener onPolygonClickListener) {
        this.zza = onPolygonClickListener;
    }

    @Override // com.google.android.gms.maps.internal.zzbf
    public final void zzb(com.google.android.gms.internal.maps.zzaa zzaaVar) {
        this.zza.onPolygonClick(new Polygon(zzaaVar));
    }
}
