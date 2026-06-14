package com.google.android.gms.safetynet;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: loaded from: classes.dex */
public final class zze implements Parcelable.Creator<zzd> {
    @Override // android.os.Parcelable.Creator
    public final /* synthetic */ zzd createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        long j = 0;
        HarmfulAppsData[] harmfulAppsDataArr = null;
        int i = 0;
        boolean z = false;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    j = SafeParcelReader.readLong(parcel, header);
                    break;
                case 3:
                    harmfulAppsDataArr = (HarmfulAppsData[]) SafeParcelReader.createTypedArray(parcel, header, HarmfulAppsData.CREATOR);
                    break;
                case 4:
                    i = SafeParcelReader.readInt(parcel, header);
                    break;
                case 5:
                    z = SafeParcelReader.readBoolean(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new zzd(j, harmfulAppsDataArr, i, z);
    }

    @Override // android.os.Parcelable.Creator
    public final /* synthetic */ zzd[] newArray(int i) {
        return new zzd[i];
    }
}
