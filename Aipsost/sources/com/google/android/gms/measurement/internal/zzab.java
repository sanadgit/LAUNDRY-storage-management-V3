package com.google.android.gms.measurement.internal;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzab implements Parcelable.Creator<zzaa> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzaa createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        String strCreateString = null;
        String strCreateString2 = null;
        zzkq zzkqVar = null;
        String strCreateString3 = null;
        zzas zzasVar = null;
        zzas zzasVar2 = null;
        zzas zzasVar3 = null;
        long j = 0;
        long j2 = 0;
        long j3 = 0;
        boolean z = false;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    strCreateString = SafeParcelReader.createString(parcel, header);
                    break;
                case 3:
                    strCreateString2 = SafeParcelReader.createString(parcel, header);
                    break;
                case 4:
                    zzkqVar = (zzkq) SafeParcelReader.createParcelable(parcel, header, zzkq.CREATOR);
                    break;
                case 5:
                    j = SafeParcelReader.readLong(parcel, header);
                    break;
                case 6:
                    z = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 7:
                    strCreateString3 = SafeParcelReader.createString(parcel, header);
                    break;
                case 8:
                    zzasVar = (zzas) SafeParcelReader.createParcelable(parcel, header, zzas.CREATOR);
                    break;
                case 9:
                    j2 = SafeParcelReader.readLong(parcel, header);
                    break;
                case 10:
                    zzasVar2 = (zzas) SafeParcelReader.createParcelable(parcel, header, zzas.CREATOR);
                    break;
                case 11:
                    j3 = SafeParcelReader.readLong(parcel, header);
                    break;
                case 12:
                    zzasVar3 = (zzas) SafeParcelReader.createParcelable(parcel, header, zzas.CREATOR);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new zzaa(strCreateString, strCreateString2, zzkqVar, j, z, strCreateString3, zzasVar, j2, zzasVar2, j3, zzasVar3);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzaa[] newArray(int i) {
        return new zzaa[i];
    }
}
