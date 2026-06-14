package com.google.android.gms.maps.model;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzp implements Parcelable.Creator<StreetViewPanoramaLocation> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ StreetViewPanoramaLocation createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        StreetViewPanoramaLink[] streetViewPanoramaLinkArr = null;
        LatLng latLng = null;
        String strCreateString = null;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    streetViewPanoramaLinkArr = (StreetViewPanoramaLink[]) SafeParcelReader.createTypedArray(parcel, header, StreetViewPanoramaLink.CREATOR);
                    break;
                case 3:
                    latLng = (LatLng) SafeParcelReader.createParcelable(parcel, header, LatLng.CREATOR);
                    break;
                case 4:
                    strCreateString = SafeParcelReader.createString(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new StreetViewPanoramaLocation(streetViewPanoramaLinkArr, latLng, strCreateString);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ StreetViewPanoramaLocation[] newArray(int i) {
        return new StreetViewPanoramaLocation[i];
    }
}
