package com.google.android.gms.internal.location;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.ClientIdentity;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-location@@18.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzk implements Parcelable.Creator<zzj> {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzj createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        com.google.android.gms.location.zzs zzsVar = zzj.zzb;
        List<ClientIdentity> listCreateTypedList = zzj.zza;
        String strCreateString = null;
        while (parcel.dataPosition() < iValidateObjectHeader) {
            int header = SafeParcelReader.readHeader(parcel);
            switch (SafeParcelReader.getFieldId(header)) {
                case 1:
                    zzsVar = (com.google.android.gms.location.zzs) SafeParcelReader.createParcelable(parcel, header, com.google.android.gms.location.zzs.CREATOR);
                    break;
                case 2:
                    listCreateTypedList = SafeParcelReader.createTypedList(parcel, header, ClientIdentity.CREATOR);
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
        return new zzj(zzsVar, listCreateTypedList, strCreateString);
    }

    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ zzj[] newArray(int i) {
        return new zzj[i];
    }
}
