package com.google.android.gms.maps;

import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.dynamic.IObjectWrapper;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class CameraUpdate {
    private final IObjectWrapper zza;

    CameraUpdate(IObjectWrapper iObjectWrapper) {
        this.zza = (IObjectWrapper) Preconditions.checkNotNull(iObjectWrapper);
    }

    public final IObjectWrapper zza() {
        return this.zza;
    }
}
