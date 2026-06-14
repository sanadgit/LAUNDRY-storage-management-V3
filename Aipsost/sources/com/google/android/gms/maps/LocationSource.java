package com.google.android.gms.maps;

import android.location.Location;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public interface LocationSource {

    /* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
    public interface OnLocationChangedListener {
        void onLocationChanged(Location location);
    }

    void activate(OnLocationChangedListener onLocationChangedListener);

    void deactivate();
}
