package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import com.google.firebase.auth.zze;
import java.util.ArrayList;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzzs implements Parcelable.Creator {
    @Override // android.os.Parcelable.Creator
    public final /* bridge */ /* synthetic */ Object createFromParcel(Parcel parcel) {
        int iValidateObjectHeader = SafeParcelReader.validateObjectHeader(parcel);
        String strCreateString = null;
        String strCreateString2 = null;
        String strCreateString3 = null;
        String strCreateString4 = null;
        zzaag zzaagVar = null;
        String strCreateString5 = null;
        String strCreateString6 = null;
        zze zzeVar = null;
        ArrayList arrayListCreateTypedList = null;
        long j = 0;
        long j2 = 0;
        boolean z = false;
        boolean z2 = false;
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
                    z = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 5:
                    strCreateString3 = SafeParcelReader.createString(parcel, header);
                    break;
                case 6:
                    strCreateString4 = SafeParcelReader.createString(parcel, header);
                    break;
                case 7:
                    zzaagVar = (zzaag) SafeParcelReader.createParcelable(parcel, header, zzaag.CREATOR);
                    break;
                case 8:
                    strCreateString5 = SafeParcelReader.createString(parcel, header);
                    break;
                case 9:
                    strCreateString6 = SafeParcelReader.createString(parcel, header);
                    break;
                case 10:
                    j = SafeParcelReader.readLong(parcel, header);
                    break;
                case 11:
                    j2 = SafeParcelReader.readLong(parcel, header);
                    break;
                case 12:
                    z2 = SafeParcelReader.readBoolean(parcel, header);
                    break;
                case 13:
                    zzeVar = (zze) SafeParcelReader.createParcelable(parcel, header, zze.CREATOR);
                    break;
                case 14:
                    arrayListCreateTypedList = SafeParcelReader.createTypedList(parcel, header, zzaac.CREATOR);
                    break;
                default:
                    SafeParcelReader.skipUnknownField(parcel, header);
                    break;
            }
        }
        SafeParcelReader.ensureAtEnd(parcel, iValidateObjectHeader);
        return new zzzr(strCreateString, strCreateString2, z, strCreateString3, strCreateString4, zzaagVar, strCreateString5, strCreateString6, j, j2, z2, zzeVar, arrayListCreateTypedList);
    }

    @Override // android.os.Parcelable.Creator
    public final /* synthetic */ Object[] newArray(int i) {
        return new zzzr[i];
    }
}
