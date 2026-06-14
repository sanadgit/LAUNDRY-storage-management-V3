package com.google.android.gms.maps.model;

import android.os.IBinder;
import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzb implements Parcelable.Creator<Cap> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ Cap createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        int i = 0;
        IBinder iBinder = null;
        Float floatObject = null;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    i = SafeParcelReader.readInt(parcel, header);
                    break;
                case 3:
                    iBinder = SafeParcelReader.readIBinder(parcel, header);
                    break;
                case 4:
                    floatObject = SafeParcelReader.readFloatObject(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new Cap(i, iBinder, floatObject);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ Cap[] newArray(int i) {
        return new Cap[i];
    }
}
