package com.google.android.gms.location;

import android.app.PendingIntent;
import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import java.util.ArrayList;

/* JADX INFO: compiled from: com.google.android.gms:play-services-location@@18.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbr implements Parcelable.Creator<zzbq> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzbq createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        String strCreateString = "";
        ArrayList<String> arrayListCreateStringList = null;
        PendingIntent pendingIntent = null;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 1:
                    arrayListCreateStringList = SafeParcelReader.createStringList(parcel, header);
                    break;
                case 2:
                    pendingIntent = (PendingIntent) SafeParcelReader.createParcelable(parcel, header, PendingIntent.CREATOR);
                    break;
                case 3:
                    strCreateString = SafeParcelReader.createString(parcel, header);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new zzbq(arrayListCreateStringList, pendingIntent, strCreateString);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzbq[] newArray(int i) {
        return new zzbq[i];
    }
}
