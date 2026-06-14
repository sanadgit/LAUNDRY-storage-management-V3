package com.google.android.gms.internal.measurement;

import android.os.Bundle;
import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbp extends zzbm implements zzbr {
    zzbp(IBinder iBinder) {
        super(iBinder, "com.google.android.finsky.externalreferrer.IGetInstallReferrerService");
    }

    @Override // com.google.android.gms.internal.measurement.zzbr
    public final Bundle zzd(Bundle bundle) throws RemoteException {
        Parcel parcelZza = zza();
        zzbo.zzd(parcelZza, bundle);
        Parcel parcelZzC = zzC(1, parcelZza);
        Bundle bundle2 = (Bundle) zzbo.zzc(parcelZzC, Bundle.CREATOR);
        parcelZzC.recycle();
        return bundle2;
    }
}
