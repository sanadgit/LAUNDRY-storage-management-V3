package com.google.android.gms.measurement.internal;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import java.util.ArrayList;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzq implements Parcelable.Creator<zzp> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzp createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        String strCreateString = "";
        String strCreateString2 = null;
        String strCreateString3 = null;
        String strCreateString4 = null;
        String strCreateString5 = null;
        String strCreateString6 = null;
        String strCreateString7 = null;
        String strCreateString8 = null;
        Boolean booleanObject = null;
        ArrayList<String> arrayListCreateStringList = null;
        String strCreateString9 = null;
        long j = 0;
        long j2 = 0;
        long j3 = 0;
        long j4 = 0;
        long j5 = 0;
        long j6 = -2147483648L;
        boolean z = true;
        boolean z2 = false;
        int i = 0;
        boolean z3 = true;
        boolean z4 = false;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    strCreateString2 = SafeParcelReader.createString(parcel, header);
                    break;
                case 3:
                    strCreateString3 = SafeParcelReader.createString(parcel, header);
                    break;
                case 4:
                    strCreateString4 = SafeParcelReader.createString(parcel, header);
                    break;
                case 5:
                    strCreateString5 = SafeParcelReader.createString(parcel, header);
                    break;
                case 6:
                    j = SafeParcelReader.readLong(parcel, header);
                    break;
                case 7:
                    j2 = SafeParcelReader.readLong(parcel, header);
                    break;
                case 8:
                    strCreateString6 = SafeParcelReader.createString(parcel, header);
                    break;
                case 9:
                    z = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 10:
                    z2 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 11:
                    j6 = SafeParcelReader.readLong(parcel, header);
                    break;
                case 12:
                    strCreateString7 = SafeParcelReader.createString(parcel, header);
                    break;
                case 13:
                    j3 = SafeParcelReader.readLong(parcel, header);
                    break;
                case 14:
                    j4 = SafeParcelReader.readLong(parcel, header);
                    break;
                case 15:
                    i = SafeParcelReader.readInt(parcel, header);
                    break;
                case 16:
                    z3 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 17:
                case 20:
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
                case 18:
                    z4 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 19:
                    strCreateString8 = SafeParcelReader.createString(parcel, header);
                    break;
                case 21:
                    booleanObject = SafeParcelReader.readBooleanObject(parcel, header);
                    break;
                case 22:
                    j5 = SafeParcelReader.readLong(parcel, header);
                    break;
                case 23:
                    arrayListCreateStringList = SafeParcelReader.createStringList(parcel, header);
                    break;
                case 24:
                    strCreateString9 = SafeParcelReader.createString(parcel, header);
                    break;
                case 25:
                    strCreateString = SafeParcelReader.createString(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new zzp(strCreateString2, strCreateString3, strCreateString4, strCreateString5, j, j2, strCreateString6, z, z2, j6, strCreateString7, j3, j4, i, z3, z4, strCreateString8, booleanObject, j5, arrayListCreateStringList, strCreateString9, strCreateString);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzp[] newArray(int i) {
        return new zzp[i];
    }
}
