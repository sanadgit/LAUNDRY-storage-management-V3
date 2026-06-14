package com.google.android.gms.location;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-location@@18.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbk implements Parcelable.Creator<zzbj> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzbj createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        String strCreateString = "";
        String strCreateString2 = "";
        String strCreateString3 = strCreateString2;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 1:
                    strCreateString2 = SafeParcelReader.createString(parcel, header);
                    break;
                case 2:
                    strCreateString3 = SafeParcelReader.createString(parcel, header);
                    break;
                case 3:
                case 4:
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
                case 5:
                    strCreateString = SafeParcelReader.createString(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new zzbj(strCreateString, strCreateString2, strCreateString3);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzbj[] newArray(int i) {
        return new zzbj[i];
    }
}
