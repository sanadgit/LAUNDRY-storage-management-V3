package com.google.android.gms.maps.model;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zza implements Parcelable.Creator<CameraPosition> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ CameraPosition createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        LatLng latLng = null;
        float f = 0.0f;
        float f2 = 0.0f;
        float f3 = 0.0f;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    latLng = (LatLng) SafeParcelReader.createParcelable(parcel, header, LatLng.CREATOR);
                    break;
                case 3:
                    f = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 4:
                    f2 = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 5:
                    f3 = SafeParcelReader.readFloat(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new CameraPosition(latLng, f, f2, f3);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ CameraPosition[] newArray(int i) {
        return new CameraPosition[i];
    }
}
