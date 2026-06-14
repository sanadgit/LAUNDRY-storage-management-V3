package com.google.android.gms.maps.model;

import android.os.RemoteException;
import com.google.android.gms.internal.maps.zzaj;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzt implements TileProvider {
    final /* synthetic */ TileOverlayOptions zza;
    private final zzaj zzb;

    zzt(TileOverlayOptions tileOverlayOptions) {
        this.zza = tileOverlayOptions;
        this.zzb = tileOverlayOptions.zza;
    }

    @Override // com.google.android.gms.maps.model.TileProvider
    public final Tile getTile(int i, int i2, int i3) {
        try {
            return this.zzb.zzb(i, i2, i3);
        } catch (RemoteException e) {
            return null;
        }
    }
}
