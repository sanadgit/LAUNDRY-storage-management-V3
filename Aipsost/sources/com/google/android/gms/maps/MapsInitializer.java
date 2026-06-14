package com.google.android.gms.maps;

import android.content.Context;
import android.os.RemoteException;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.maps.internal.zzca;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.RuntimeRemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class MapsInitializer {
    private static boolean zza = false;

    private MapsInitializer() {
    }

    public static synchronized int initialize(Context context) {
        Preconditions.checkNotNull(context, "Context is null");
        if (!zza) {
            try {
                com.google.android.gms.maps.internal.zzf zzfVarZza = zzca.zza(context);
                try {
                    CameraUpdateFactory.zza(zzfVarZza.zzf());
                    BitmapDescriptorFactory.zza(zzfVarZza.zzg());
                    zza = true;
                } catch (RemoteException e) {
                    throw new RuntimeRemoteException(e);
                }
            } catch (GooglePlayServicesNotAvailableException e2) {
                return e2.errorCode;
            }
        }
        return 0;
    }
}
