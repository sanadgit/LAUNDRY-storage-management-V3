package com.google.android.gms.maps.internal;

import android.content.Context;
import android.os.IBinder;
import android.os.IInterface;
import android.os.RemoteException;
import android.util.Log;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.dynamic.ObjectWrapper;
import com.google.android.gms.dynamite.DynamiteModule;
import com.google.android.gms.maps.model.RuntimeRemoteException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class zzca {
    private static final String zza = zzca.class.getSimpleName();
    private static Context zzb = null;
    private static zzf zzc;

    public static zzf zza(Context context) throws GooglePlayServicesNotAvailableException {
        zzf zzeVar;
        Preconditions.checkNotNull(context);
        zzf zzfVar = zzc;
        if (zzfVar != null) {
            return zzfVar;
        }
        int iIsGooglePlayServicesAvailable = GooglePlayServicesUtil.isGooglePlayServicesAvailable(context, 13400000);
        switch (iIsGooglePlayServicesAvailable) {
            case 0:
                Log.i(zza, "Making Creator dynamically");
                try {
                    IBinder iBinder = (IBinder) zzc(((ClassLoader) Preconditions.checkNotNull(zzb(context).getClassLoader())).loadClass("com.google.android.gms.maps.internal.CreatorImpl"));
                    if (iBinder == null) {
                        zzeVar = null;
                    } else {
                        IInterface iInterfaceQueryLocalInterface = iBinder.queryLocalInterface("com.google.android.gms.maps.internal.ICreator");
                        zzeVar = iInterfaceQueryLocalInterface instanceof zzf ? (zzf) iInterfaceQueryLocalInterface : new zze(iBinder);
                    }
                    zzc = zzeVar;
                    try {
                        zzeVar.zzh(ObjectWrapper.wrap(zzb(context).getResources()), GooglePlayServicesUtil.GOOGLE_PLAY_SERVICES_VERSION_CODE);
                        return zzc;
                    } catch (RemoteException e) {
                        throw new RuntimeRemoteException(e);
                    }
                } catch (ClassNotFoundException e2) {
                    throw new IllegalStateException("Unable to find dynamic class com.google.android.gms.maps.internal.CreatorImpl");
                }
            default:
                throw new GooglePlayServicesNotAvailableException(iIsGooglePlayServicesAvailable);
        }
    }

    private static Context zzb(Context context) {
        Context remoteContext;
        Context context2 = zzb;
        if (context2 != null) {
            return context2;
        }
        try {
            remoteContext = DynamiteModule.load(context, DynamiteModule.PREFER_REMOTE, "com.google.android.gms.maps_dynamite").getModuleContext();
        } catch (Exception e) {
            Log.e(zza, "Failed to load maps module, use legacy", e);
            remoteContext = GooglePlayServicesUtil.getRemoteContext(context);
        }
        zzb = remoteContext;
        return remoteContext;
    }

    private static <T> T zzc(Class cls) {
        try {
            return (T) cls.newInstance();
        } catch (IllegalAccessException e) {
            String strValueOf = String.valueOf(cls.getName());
            throw new IllegalStateException(strValueOf.length() != 0 ? "Unable to call the default constructor of ".concat(strValueOf) : new String("Unable to call the default constructor of "));
        } catch (InstantiationException e2) {
            String strValueOf2 = String.valueOf(cls.getName());
            throw new IllegalStateException(strValueOf2.length() != 0 ? "Unable to instantiate the dynamic class ".concat(strValueOf2) : new String("Unable to instantiate the dynamic class "));
        }
    }
}
