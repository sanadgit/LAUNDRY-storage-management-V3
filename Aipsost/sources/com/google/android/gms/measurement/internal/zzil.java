package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzil implements Runnable {
    final /* synthetic */ String zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ zzp zzc;
    final /* synthetic */ boolean zzd;
    final /* synthetic */ com.google.android.gms.internal.measurement.zzcf zze;
    final /* synthetic */ zzjk zzf;

    zzil(zzjk zzjkVar, String str, String str2, zzp zzpVar, boolean z, com.google.android.gms.internal.measurement.zzcf zzcfVar) {
        this.zzf = zzjkVar;
        this.zza = str;
        this.zzb = str2;
        this.zzc = zzpVar;
        this.zzd = z;
        this.zze = zzcfVar;
    }

    @Override // java.lang.Runnable
    public final void run() throws Throwable {
        Bundle bundle;
        RemoteException e;
        Bundle bundle2 = new Bundle();
        try {
            zzed zzedVar = this.zzf.zzb;
            if (zzedVar == null) {
                this.zzf.zzs.zzau().zzb().zzc("Failed to get user properties; not connected to service", this.zza, this.zzb);
                this.zzf.zzs.zzl().zzai(this.zze, bundle2);
                return;
            }
            Preconditions.checkNotNull(this.zzc);
            List<zzkq> listZzo = zzedVar.zzo(this.zza, this.zzb, this.zzd, this.zzc);
            bundle = new Bundle();
            if (listZzo != null) {
                for (zzkq zzkqVar : listZzo) {
                    String str = zzkqVar.zze;
                    if (str != null) {
                        bundle.putString(zzkqVar.zzb, str);
                    } else {
                        Long l = zzkqVar.zzd;
                        if (l != null) {
                            bundle.putLong(zzkqVar.zzb, l.longValue());
                        } else {
                            Double d = zzkqVar.zzg;
                            if (d != null) {
                                bundle.putDouble(zzkqVar.zzb, d.doubleValue());
                            }
                        }
                    }
                }
            }
            try {
                try {
                    this.zzf.zzP();
                    this.zzf.zzs.zzl().zzai(this.zze, bundle);
                } catch (Throwable th) {
                    th = th;
                    bundle2 = bundle;
                    this.zzf.zzs.zzl().zzai(this.zze, bundle2);
                    throw th;
                }
            } catch (RemoteException e2) {
                e = e2;
                this.zzf.zzs.zzau().zzb().zzc("Failed to get user properties; remote exception", this.zza, e);
                this.zzf.zzs.zzl().zzai(this.zze, bundle);
            }
        } catch (RemoteException e3) {
            bundle = bundle2;
            e = e3;
        } catch (Throwable th2) {
            th = th2;
            this.zzf.zzs.zzl().zzai(this.zze, bundle2);
            throw th;
        }
    }
}
