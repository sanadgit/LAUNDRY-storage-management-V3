package com.google.android.gms.internal.maps;

import android.os.IBinder;
import android.os.IInterface;
import android.os.RemoteException;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public interface zzr extends IInterface {
    int zzd() throws RemoteException;

    int zze() throws RemoteException;

    List<IBinder> zzf() throws RemoteException;

    boolean zzg() throws RemoteException;

    boolean zzh(zzr zzrVar) throws RemoteException;

    int zzi() throws RemoteException;
}
