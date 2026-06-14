package com.google.android.gms.internal.p000authapiphone;

import android.os.IBinder;
import android.os.Parcel;
import android.os.RemoteException;
import com.google.android.gms.common.api.internal.IStatusCallback;

/* JADX INFO: compiled from: com.google.android.gms:play-services-auth-api-phone@@17.4.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzi extends zzb implements zzj {
    zzi(IBinder iBinder) {
        super(iBinder, "com.google.android.gms.auth.api.phone.internal.ISmsRetrieverApiService");
    }

    @Override // com.google.android.gms.internal.p000authapiphone.zzj
    public final void zza(zzl zzlVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzd.zza(parcelZza, zzlVar);
        zza(1, parcelZza);
    }

    @Override // com.google.android.gms.internal.p000authapiphone.zzj
    public final void zza(String str, zzl zzlVar) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        zzd.zza(parcelZza, zzlVar);
        zza(2, parcelZza);
    }

    @Override // com.google.android.gms.internal.p000authapiphone.zzj
    public final void zza(IStatusCallback iStatusCallback) throws RemoteException {
        Parcel parcelZza = zza();
        zzd.zza(parcelZza, iStatusCallback);
        zza(3, parcelZza);
    }

    @Override // com.google.android.gms.internal.p000authapiphone.zzj
    public final void zza(zzf zzfVar) throws RemoteException {
        Parcel parcelZza = zza();
        zzd.zza(parcelZza, zzfVar);
        zza(4, parcelZza);
    }

    @Override // com.google.android.gms.internal.p000authapiphone.zzj
    public final void zza(String str, zzh zzhVar) throws RemoteException {
        Parcel parcelZza = zza();
        parcelZza.writeString(str);
        zzd.zza(parcelZza, zzhVar);
        zza(5, parcelZza);
    }
}
