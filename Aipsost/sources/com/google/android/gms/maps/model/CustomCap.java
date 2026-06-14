package com.google.android.gms.maps.model;

import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class CustomCap extends Cap {
    public final BitmapDescriptor bitmapDescriptor;
    public final float refWidth;

    public CustomCap(BitmapDescriptor bitmapDescriptor) {
        this(bitmapDescriptor, 10.0f);
    }

    @Override // com.google.android.gms.maps.model.Cap
    public String toString() {
        String strValueOf = String.valueOf(this.bitmapDescriptor);
        float f = this.refWidth;
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 55);
        sb.append("[CustomCap: bitmapDescriptor=");
        sb.append(strValueOf);
        sb.append(" refWidth=");
        sb.append(f);
        sb.append("]");
        return sb.toString();
    }

    /* JADX WARN: Illegal instructions before constructor call */
    public CustomCap(BitmapDescriptor bitmapDescriptor, float refWidth) {
        BitmapDescriptor bitmapDescriptor2 = (BitmapDescriptor) Preconditions.checkNotNull(bitmapDescriptor, "bitmapDescriptor must not be null");
        if (refWidth <= 0.0f) {
            throw new IllegalArgumentException("refWidth must be positive");
        }
        super(bitmapDescriptor2, refWidth);
        this.bitmapDescriptor = bitmapDescriptor;
        this.refWidth = refWidth;
    }
}
