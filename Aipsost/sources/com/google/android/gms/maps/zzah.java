package com.google.android.gms.maps;

import android.content.Context;
import android.os.RemoteException;
import android.view.ViewGroup;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.dynamic.DeferredLifecycleHelper;
import com.google.android.gms.dynamic.ObjectWrapper;
import com.google.android.gms.dynamic.OnDelegateCreatedListener;
import com.google.android.gms.maps.internal.IMapViewDelegate;
import com.google.android.gms.maps.internal.zzca;
import com.google.android.gms.maps.model.RuntimeRemoteException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
final class zzah extends DeferredLifecycleHelper<zzag> {
    protected OnDelegateCreatedListener<zzag> zza;
    private final ViewGroup zzb;
    private final Context zzc;
    private final GoogleMapOptions zzd;
    private final List<OnMapReadyCallback> zze = new ArrayList();

    zzah(ViewGroup viewGroup, Context context, GoogleMapOptions googleMapOptions) {
        this.zzb = viewGroup;
        this.zzc = context;
        this.zzd = googleMapOptions;
    }

    @Override // com.google.android.gms.dynamic.DeferredLifecycleHelper
    protected final void createDelegate(OnDelegateCreatedListener<zzag> onDelegateCreatedListener) {
        this.zza = onDelegateCreatedListener;
        zza();
    }

    public final void zza() {
        if (this.zza == null || getDelegate() != null) {
            return;
        }
        try {
            MapsInitializer.initialize(this.zzc);
            IMapViewDelegate iMapViewDelegateZze = zzca.zza(this.zzc).zze(ObjectWrapper.wrap(this.zzc), this.zzd);
            if (iMapViewDelegateZze == null) {
                return;
            }
            this.zza.onDelegateCreated(new zzag(this.zzb, iMapViewDelegateZze));
            Iterator<OnMapReadyCallback> it = this.zze.iterator();
            while (it.hasNext()) {
                getDelegate().getMapAsync(it.next());
            }
            this.zze.clear();
        } catch (RemoteException e) {
            throw new RuntimeRemoteException(e);
        } catch (GooglePlayServicesNotAvailableException e2) {
        }
    }

    public final void zzb(OnMapReadyCallback onMapReadyCallback) {
        if (getDelegate() != null) {
            getDelegate().getMapAsync(onMapReadyCallback);
        } else {
            this.zze.add(onMapReadyCallback);
        }
    }
}
