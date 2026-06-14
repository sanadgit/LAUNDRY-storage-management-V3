package com.google.android.gms.maps.model;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzg implements Parcelable.Creator<LatLng> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ LatLng createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        double d = 0.0d;
        double d2 = 0.0d;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    d = SafeParcelReader.readDouble(parcel, header);
                    break;
                case 3:
                    d2 = SafeParcelReader.readDouble(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new LatLng(d, d2);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ LatLng[] newArray(int i) {
        return new LatLng[i];
    }
}
