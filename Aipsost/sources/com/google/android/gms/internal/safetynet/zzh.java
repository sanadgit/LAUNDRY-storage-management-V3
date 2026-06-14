package com.google.android.gms.internal.safetynet;

import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.safetynet.SafeBrowsingData;

/* JADX INFO: loaded from: classes.dex */
public abstract class zzh extends zzb implements zzg {
    public zzh() {
        super("com.google.android.gms.safetynet.internal.ISafetyNetCallbacks");
    }

    @Override // com.google.android.gms.internal.safetynet.zzb
    protected final boolean dispatchTransaction(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        switch (i) {
            case 1:
                zza((Status) zzc.zza(parcel, Status.CREATOR), (com.google.android.gms.safetynet.zza) zzc.zza(parcel, com.google.android.gms.safetynet.zza.CREATOR));
                return true;
            case 2:
                zza(parcel.readString());
                return true;
            case 3:
                zza((Status) zzc.zza(parcel, Status.CREATOR), (SafeBrowsingData) zzc.zza(parcel, SafeBrowsingData.CREATOR));
                return true;
            case 4:
                zza((Status) zzc.zza(parcel, Status.CREATOR), zzc.zza(parcel));
                return true;
            case 5:
            case 7:
            case 9:
            case 12:
            case 13:
            case 14:
            default:
                return false;
            case 6:
                zza((Status) zzc.zza(parcel, Status.CREATOR), (com.google.android.gms.safetynet.zzf) zzc.zza(parcel, com.google.android.gms.safetynet.zzf.CREATOR));
                return true;
            case 8:
                zza((Status) zzc.zza(parcel, Status.CREATOR), (com.google.android.gms.safetynet.zzd) zzc.zza(parcel, com.google.android.gms.safetynet.zzd.CREATOR));
                return true;
            case 10:
                zzb((Status) zzc.zza(parcel, Status.CREATOR), zzc.zza(parcel));
                return true;
            case 11:
                zza((Status) zzc.zza(parcel, Status.CREATOR));
                return true;
            case 15:
                zza((Status) zzc.zza(parcel, Status.CREATOR), (com.google.android.gms.safetynet.zzh) zzc.zza(parcel, com.google.android.gms.safetynet.zzh.CREATOR));
                return true;
        }
    }
}
