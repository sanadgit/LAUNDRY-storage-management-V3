package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;
import java.util.ArrayList;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjc implements Runnable {
    final /* synthetic */ String zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ zzp zzc;
    final /* synthetic */ com.google.android.gms.internal.measurement.zzcf zzd;
    final /* synthetic */ zzjk zze;

    zzjc(zzjk zzjkVar, String str, String str2, zzp zzpVar, com.google.android.gms.internal.measurement.zzcf zzcfVar) {
        this.zze = zzjkVar;
        this.zza = str;
        this.zzb = str2;
        this.zzc = zzpVar;
        this.zzd = zzcfVar;
    }

    @Override // java.lang.Runnable
    public final void run() throws Throwable {
        zzfu zzfuVar;
        ArrayList<Bundle> arrayList = new ArrayList<>();
        try {
            zzed zzedVar = this.zze.zzb;
            if (zzedVar == null) {
                this.zze.zzs.zzau().zzb().zzc("Failed to get conditional properties; not connected to service", this.zza, this.zzb);
                zzfuVar = this.zze.zzs;
            } else {
                Preconditions.checkNotNull(this.zzc);
                arrayList = zzku.zzak(zzedVar.zzq(this.zza, this.zzb, this.zzc));
                try {
                    try {
                        this.zze.zzP();
                        zzfuVar = this.zze.zzs;
                    } catch (Throwable th) {
                        th = th;
                        this.zze.zzs.zzl().zzaj(this.zzd, arrayList);
                        throw th;
                    }
                } catch (RemoteException e) {
                    e = e;
                    this.zze.zzs.zzau().zzb().zzd("Failed to get conditional properties; remote exception", this.zza, this.zzb, e);
                    zzfuVar = this.zze.zzs;
                }
            }
        } catch (RemoteException e2) {
            e = e2;
        } catch (Throwable th2) {
            th = th2;
            this.zze.zzs.zzl().zzaj(this.zzd, arrayList);
            throw th;
        }
        zzfuVar.zzl().zzaj(this.zzd, arrayList);
    }
}
