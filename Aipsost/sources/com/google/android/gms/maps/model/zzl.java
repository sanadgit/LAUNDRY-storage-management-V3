package com.google.android.gms.maps.model;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import java.util.ArrayList;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzl implements Parcelable.Creator<PolygonOptions> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ PolygonOptions createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        ArrayList arrayList = new ArrayList();
        ArrayList arrayListCreateTypedList = null;
        ArrayList arrayListCreateTypedList2 = null;
        float f = 0.0f;
        int i = 0;
        int i2 = 0;
        float f2 = 0.0f;
        boolean z = false;
        boolean z2 = false;
        boolean z3 = false;
        int i3 = 0;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    arrayListCreateTypedList = SafeParcelReader.createTypedList(parcel, header, LatLng.CREATOR);
                    break;
                case 3:
                    SafeParcelReader.readList(parcel, header, arrayList, getClass().getClassLoader());
                    break;
                case 4:
                    f = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 5:
                    i = SafeParcelReader.readInt(parcel, header);
                    break;
                case 6:
                    i2 = SafeParcelReader.readInt(parcel, header);
                    break;
                case 7:
                    f2 = SafeParcelReader.readFloat(parcel, header);
                    break;
                case 8:
                    z = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 9:
                    z2 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 10:
                    z3 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 11:
                    i3 = SafeParcelReader.readInt(parcel, header);
                    break;
                case 12:
                    arrayListCreateTypedList2 = SafeParcelReader.createTypedList(parcel, header, PatternItem.CREATOR);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new PolygonOptions(arrayListCreateTypedList, arrayList, f, i, i2, f2, z, z2, z3, i3, arrayListCreateTypedList2);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ PolygonOptions[] newArray(int i) {
        return new PolygonOptions[i];
    }
}
