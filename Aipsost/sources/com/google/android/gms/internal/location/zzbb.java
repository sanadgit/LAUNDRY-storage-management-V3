package com.google.android.gms.internal.location;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.ClientIdentity;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import com.google.android.gms.location.LocationRequest;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-location@@18.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbb implements Parcelable.Creator<zzba> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzba createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        List<ClientIdentity> listCreateTypedList = zzba.zza;
        LocationRequest locationRequest = null;
        String strCreateString = null;
        String strCreateString2 = null;
        String strCreateString3 = null;
        long j = Long.MAX_VALUE;
        boolean z = false;
        boolean z2 = false;
        boolean z3 = false;
        boolean z4 = false;
        boolean z5 = false;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 1:
                    locationRequest = (LocationRequest) SafeParcelReader.createParcelable(parcel, header, LocationRequest.CREATOR);
                    break;
                case 2:
                case 3:
                case 4:
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
                case 5:
                    listCreateTypedList = SafeParcelReader.createTypedList(parcel, header, ClientIdentity.CREATOR);
                    break;
                case 6:
                    strCreateString = SafeParcelReader.createString(parcel, header);
                    break;
                case 7:
                    z = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 8:
                    z2 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 9:
                    z3 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 10:
                    strCreateString2 = SafeParcelReader.createString(parcel, header);
                    break;
                case 11:
                    z4 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 12:
                    z5 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 13:
                    strCreateString3 = SafeParcelReader.createString(parcel, header);
                    break;
                case 14:
                    j = SafeParcelReader.readLong(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new zzba(locationRequest, listCreateTypedList, strCreateString, z, z2, z3, strCreateString2, z4, z5, strCreateString3, j);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzba[] newArray(int i) {
        return new zzba[i];
    }
}
