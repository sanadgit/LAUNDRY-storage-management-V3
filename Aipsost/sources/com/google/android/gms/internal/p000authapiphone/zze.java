package com.google.android.gms.internal.p000authapiphone;

import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.common.api.Status;

/* JADX INFO: compiled from: com.google.android.gms:play-services-auth-api-phone@@17.4.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zze extends zza implements zzf {
    public zze() {
        super("com.google.android.gms.auth.api.phone.internal.IAutofillPermissionStateCallback");
    }

    @Override // com.google.android.gms.internal.p000authapiphone.zza
    protected final boolean zza(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
        if (i == 1) {
            zza((Status) zzd.zza(parcel, Status.CREATOR), parcel.readInt());
            return true;
        }
        return false;
    }
}
