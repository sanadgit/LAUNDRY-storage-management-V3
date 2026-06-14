package com.google.android.gms.maps.model;

import android.os.IBinder;
import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzd implements Parcelable.Creator<GroundOverlayOptions> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ GroundOverlayOptions createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        IBinder iBinder = null;
        LatLng latLng = null;
        LatLngBounds latLngBounds = null;
        float f = 0.0f;
        float f2 = 0.0f;
        float f3 = 0.0f;
        float f4 = 0.0f;
        boolean z = false;
        float f5 = 0.0f;
        float f6 = 0.0f;
        float f7 = 0.0f;
        boolean z2 = false;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    iBinder = SafeParcelReader.readIBinder(parcel, header);
                    break;
                case 3:
                    latLng = (LatLng) SafeParcelReader.createParcelable(parcel, header, LatLng.CREATOR);
                    break;
                case 4:
                    f = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 5:
                    f2 = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 6:
                    latLngBounds = (LatLngBounds) SafeParcelReader.createParcelable(parcel, header, LatLngBounds.CREATOR);
                    break;
                case 7:
                    f3 = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 8:
                    f4 = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 9:
                    z = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 10:
                    f5 = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 11:
                    f6 = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 12:
                    f7 = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 13:
                    z2 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new GroundOverlayOptions(iBinder, latLng, f, f2, latLngBounds, f3, f4, z, f5, f6, f7, z2);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ GroundOverlayOptions[] newArray(int i) {
        return new GroundOverlayOptions[i];
    }
}
