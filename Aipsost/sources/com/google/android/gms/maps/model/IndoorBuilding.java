package com.google.android.gms.maps.model;

import android.os.IBinder;
import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class IndoorBuilding {
    private final com.google.android.gms.internal.maps.zzr zza;
    private final zze zzb;

    public IndoorBuilding(com.google.android.gms.internal.maps.zzr zzrVar) {
        zze zzeVar = zze.zza;
        this.zza = (com.google.android.gms.internal.maps.zzr) Preconditions.checkNotNull(zzrVar, "delegate");
        this.zzb = (zze) Preconditions.checkNotNull(zzeVar, "shim");
    }

    public boolean equals(@Nullable Object other) {
        if (!(other instanceof IndoorBuilding)) {
            return false;
        }
        try {
            return this.zza.zzh(((IndoorBuilding) other).zza);
        } catch (RemoteException e) {
            throw new RuntimeRemoteException(e);
        }
    }

    public int getActiveLevelIndex() {
        try {
            return this.zza.zzd();
        } catch (RemoteException e) {
            throw new RuntimeRemoteException(e);
        }
    }

    public int getDefaultLevelIndex() {
        try {
            return this.zza.zze();
        } catch (RemoteException e) {
            throw new RuntimeRemoteException(e);
        }
    }

    public List<IndoorLevel> getLevels() {
        try {
            List<IBinder> listZzf = this.zza.zzf();
            ArrayList arrayList = new ArrayList(listZzf.size());
            Iterator<IBinder> it = listZzf.iterator();
            while (it.hasNext()) {
                arrayList.add(new IndoorLevel(com.google.android.gms.internal.maps.zzt.zzb(it.next())));
            }
            return arrayList;
        } catch (RemoteException e) {
            throw new RuntimeRemoteException(e);
        }
    }

    public int hashCode() {
        try {
            return this.zza.zzi();
        } catch (RemoteException e) {
            throw new RuntimeRemoteException(e);
        }
    }

    public boolean isUnderground() {
        try {
            return this.zza.zzg();
        } catch (RemoteException e) {
            throw new RuntimeRemoteException(e);
        }
    }
}
