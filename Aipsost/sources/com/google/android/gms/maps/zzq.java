package com.google.android.gms.maps;

import android.graphics.Bitmap;
import android.os.RemoteException;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.dynamic.ObjectWrapper;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.internal.zzbt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzq extends zzbt {
    final /* synthetic */ GoogleMap.SnapshotReadyCallback zza;

    zzq(GoogleMap googleMap, GoogleMap.SnapshotReadyCallback snapshotReadyCallback) {
        this.zza = snapshotReadyCallback;
    }

    @Override // com.google.android.gms.maps.internal.zzbu
    public final void zzb(Bitmap bitmap) throws RemoteException {
        this.zza.onSnapshotReady(bitmap);
    }

    @Override // com.google.android.gms.maps.internal.zzbu
    public final void zzc(IObjectWrapper iObjectWrapper) throws RemoteException {
        this.zza.onSnapshotReady((Bitmap) ObjectWrapper.unwrap(iObjectWrapper));
    }
}
