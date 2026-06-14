package com.google.android.gms.cloudmessaging;

import android.content.Intent;
import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;

/* JADX INFO: compiled from: com.google.android.gms:play-services-cloud-messaging@@16.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzb implements Parcelable.Creator<CloudMessage> {
    @Override // android.os.Parcelable.Creator
    public final /* synthetic */ CloudMessage[] newArray(int i) {
        return new CloudMessage[i];
    }

    @Override // android.os.Parcelable.Creator
    public final /* synthetic */ CloudMessage createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        Intent intent = null;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 1:
                    intent = (Intent) SafeParcelReader.createParcelable(parcel, header, Intent.CREATOR);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new CloudMessage(intent);
    }
}
