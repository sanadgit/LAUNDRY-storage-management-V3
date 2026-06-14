package com.google.android.gms.maps;

import com.google.android.gms.maps.GoogleMap;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzaa extends com.google.android.gms.maps.internal.zzc {
    private final GoogleMap.CancelableCallback zza;

    zzaa(GoogleMap.CancelableCallback cancelableCallback) {
        this.zza = cancelableCallback;
    }

    @Override // com.google.android.gms.maps.internal.zzd
    public final void zzb() {
        this.zza.onFinish();
    }

    @Override // com.google.android.gms.maps.internal.zzd
    public final void zzc() {
        this.zza.onCancel();
    }
}
