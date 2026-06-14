package com.google.android.gms.maps.model;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzk implements Parcelable.Creator<PointOfInterest> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ PointOfInterest createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        LatLng latLng = null;
        String strCreateString = null;
        String strCreateString2 = null;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    latLng = (LatLng) SafeParcelReader.createParcelable(parcel, header, LatLng.CREATOR);
                    break;
                case 3:
                    strCreateString = SafeParcelReader.createString(parcel, header);
                    break;
                case 4:
                    strCreateString2 = SafeParcelReader.createString(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new PointOfInterest(latLng, strCreateString, strCreateString2);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ PointOfInterest[] newArray(int i) {
        return new PointOfInterest[i];
    }
}
