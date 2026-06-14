package com.google.android.gms.location;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-location@@18.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbm implements Parcelable.Creator<LocationSettingsResult> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ LocationSettingsResult createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        Status status = null;
        LocationSettingsStates locationSettingsStates = null;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 1:
                    status = (Status) SafeParcelReader.createParcelable(parcel, header, Status.CREATOR);
                    break;
                case 2:
                    locationSettingsStates = (LocationSettingsStates) SafeParcelReader.createParcelable(parcel, header, LocationSettingsStates.CREATOR);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new LocationSettingsResult(status, locationSettingsStates);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ LocationSettingsResult[] newArray(int i) {
        return new LocationSettingsResult[i];
    }
}
