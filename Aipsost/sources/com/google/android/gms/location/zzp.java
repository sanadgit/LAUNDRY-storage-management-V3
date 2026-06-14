package com.google.android.gms.location;

import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import java.util.ArrayList;

/* JADX INFO: compiled from: com.google.android.gms:play-services-location@@18.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzp implements Parcelable.Creator<ActivityTransitionResult> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ ActivityTransitionResult createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        ArrayList arrayListCreateTypedList = null;
        Bundle bundleCreateBundle = null;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 1:
                    arrayListCreateTypedList = SafeParcelReader.createTypedList(parcel, header, ActivityTransitionEvent.CREATOR);
                    break;
                case 2:
                    bundleCreateBundle = SafeParcelReader.createBundle(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new ActivityTransitionResult(arrayListCreateTypedList, bundleCreateBundle);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ ActivityTransitionResult[] newArray(int i) {
        return new ActivityTransitionResult[i];
    }
}
