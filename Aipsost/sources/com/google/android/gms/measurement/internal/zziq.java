package com.google.android.gms.measurement.internal;

import android.os.RemoteException;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zziq implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ com.google.android.gms.internal.measurement.zzcf zzb;
    final /* synthetic */ zzjk zzc;

    zziq(zzjk zzjkVar, zzp zzpVar, com.google.android.gms.internal.measurement.zzcf zzcfVar) {
        this.zzc = zzjkVar;
        this.zza = zzpVar;
        this.zzb = zzcfVar;
    }

    /* JADX WARN: Multi-variable type inference failed */
    /* JADX WARN: Type inference failed for: r0v14 */
    /* JADX WARN: Type inference failed for: r0v17 */
    /* JADX WARN: Type inference failed for: r0v18 */
    /* JADX WARN: Type inference failed for: r0v19 */
    @Override // java.lang.Runnable
    public final void run() throws Throwable {
        zzfu zzfuVar = "Failed to get app instance id";
        String strZzl = null;
        try {
            try {
                if (this.zzc.zzs.zzd().zzi().zzh()) {
                    zzed zzedVar = this.zzc.zzb;
                    if (zzedVar == null) {
                        this.zzc.zzs.zzau().zzb().zza("Failed to get app instance id");
                        zzfuVar = this.zzc.zzs;
                    } else {
                        Preconditions.checkNotNull(this.zza);
                        strZzl = zzedVar.zzl(this.zza);
                        if (strZzl != null) {
                            try {
                                this.zzc.zzs.zzk().zzE(strZzl);
                                this.zzc.zzs.zzd().zze.zzb(strZzl);
                            } catch (RemoteException e) {
                                e = e;
                                this.zzc.zzs.zzau().zzb().zzb(zzfuVar, e);
                                zzfuVar = this.zzc.zzs;
                            }
                        }
                        this.zzc.zzP();
                        zzfuVar = this.zzc.zzs;
                    }
                } else {
                    this.zzc.zzs.zzau().zzh().zza("Analytics storage consent denied; will not get app instance id");
                    this.zzc.zzs.zzk().zzE(null);
                    this.zzc.zzs.zzd().zze.zzb(null);
                    zzfuVar = this.zzc.zzs;
                }
            } catch (RemoteException e2) {
                e = e2;
            } catch (Throwable th) {
                th = th;
                this.zzc.zzs.zzl().zzad(this.zzb, strZzl);
                throw th;
            }
            zzfuVar.zzl().zzad(this.zzb, strZzl);
        } catch (Throwable th2) {
            th = th2;
            this.zzc.zzs.zzl().zzad(this.zzb, strZzl);
            throw th;
        }
    }
}
