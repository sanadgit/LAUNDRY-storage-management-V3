package com.google.android.gms.measurement.internal;

import android.os.RemoteException;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjd implements Runnable {
    final /* synthetic */ AtomicReference zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ String zzc;
    final /* synthetic */ zzp zzd;
    final /* synthetic */ boolean zze;
    final /* synthetic */ zzjk zzf;

    zzjd(zzjk zzjkVar, AtomicReference atomicReference, String str, String str2, String str3, zzp zzpVar, boolean z) {
        this.zzf = zzjkVar;
        this.zza = atomicReference;
        this.zzb = str2;
        this.zzc = str3;
        this.zzd = zzpVar;
        this.zze = z;
    }

    @Override // java.lang.Runnable
    public final void run() {
        AtomicReference atomicReference;
        zzed zzedVar;
        synchronized (this.zza) {
            try {
                try {
                    zzedVar = this.zzf.zzb;
                } catch (RemoteException e) {
                    this.zzf.zzs.zzau().zzb().zzd("(legacy) Failed to get user properties; remote exception", null, this.zzb, e);
                    this.zza.set(Collections.emptyList());
                    atomicReference = this.zza;
                }
                if (zzedVar == null) {
                    this.zzf.zzs.zzau().zzb().zzd("(legacy) Failed to get user properties; not connected to service", null, this.zzb, this.zzc);
                    this.zza.set(Collections.emptyList());
                    return;
                }
                if (TextUtils.isEmpty(null)) {
                    Preconditions.checkNotNull(this.zzd);
                    this.zza.set(zzedVar.zzo(this.zzb, this.zzc, this.zze, this.zzd));
                } else {
                    this.zza.set(zzedVar.zzp(null, this.zzb, this.zzc, this.zze));
                }
                this.zzf.zzP();
                atomicReference = this.zza;
                atomicReference.notify();
            } finally {
                this.zza.notify();
            }
        }
    }
}
