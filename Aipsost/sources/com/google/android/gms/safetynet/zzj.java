package com.google.android.gms.safetynet;

import android.os.Parcel;
import android.os.ParcelFileDescriptor;
import android.os.Parcelable;
import com.google.android.gms.common.data.DataHolder;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;

/* JADX INFO: loaded from: classes.dex */
public final class zzj implements Parcelable.Creator<SafeBrowsingData> {
    static void zza(SafeBrowsingData safeBrowsingData, Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeString(parcel, 2, safeBrowsingData.getMetadata(), false);
        SafeParcelWriter.writeParcelable(parcel, 3, safeBrowsingData.getBlacklistsDataHolder(), i, false);
        SafeParcelWriter.writeParcelable(parcel, 4, safeBrowsingData.getFileDescriptor(), i, false);
        SafeParcelWriter.writeLong(parcel, 5, safeBrowsingData.getLastUpdateTimeMs());
        SafeParcelWriter.writeByteArray(parcel, 6, safeBrowsingData.getState(), false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    @Override // android.os.Parcelable.Creator
    public final /* synthetic */ SafeBrowsingData createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        String strCreateString = null;
        DataHolder dataHolder = null;
        ParcelFileDescriptor parcelFileDescriptor = null;
        byte[] bArrCreateByteArray = null;
        long j = 0;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 2:
                    strCreateString = SafeParcelReader.createString(parcel, header);
                    break;
                case 3:
                    dataHolder = (DataHolder) SafeParcelReader.createParcelable(parcel, header, DataHolder.CREATOR);
                    break;
                case 4:
                    parcelFileDescriptor = (ParcelFileDescriptor) SafeParcelReader.createParcelable(parcel, header, ParcelFileDescriptor.CREATOR);
                    break;
                case 5:
                    j = SafeParcelReader.readLong(parcel, header);
                    break;
                case 6:
                    bArrCreateByteArray = SafeParcelReader.createByteArray(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new SafeBrowsingData(strCreateString, dataHolder, parcelFileDescriptor, j, bArrCreateByteArray);
    }

    @Override // android.os.Parcelable.Creator
    public final /* synthetic */ SafeBrowsingData[] newArray(int i) {
        return new SafeBrowsingData[i];
    }
}
