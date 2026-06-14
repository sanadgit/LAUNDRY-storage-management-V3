package com.google.android.gms.maps.internal;

import android.os.IInterface;
import android.os.RemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public interface ILocationSourceDelegate extends IInterface {
    void activate(zzaj zzajVar) throws RemoteException;

    void deactivate() throws RemoteException;
}
