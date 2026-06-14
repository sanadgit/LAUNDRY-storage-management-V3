package com.google.android.gms.measurement.internal;

import android.os.RemoteException;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjb implements Runnable {
    final /* synthetic */ AtomicReference zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ String zzc;
    final /* synthetic */ zzp zzd;
    final /* synthetic */ zzjk zze;

    zzjb(zzjk zzjkVar, AtomicReference atomicReference, String str, String str2, String str3, zzp zzpVar) {
        this.zze = zzjkVar;
        this.zza = atomicReference;
        this.zzb = str2;
        this.zzc = str3;
        this.zzd = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        AtomicReference atomicReference;
        zzed zzedVar;
        synchronized (this.zza) {
            try {
                try {
                    zzedVar = this.zze.zzb;
                } catch (RemoteException e) {
                    this.zze.zzs.zzau().zzb().zzd("(legacy) Failed to get conditional properties; remote exception", null, this.zzb, e);
                    this.zza.set(Collections.emptyList());
                    atomicReference = this.zza;
                }
                if (zzedVar == null) {
                    this.zze.zzs.zzau().zzb().zzd("(legacy) Failed to get conditional properties; not connected to service", null, this.zzb, this.zzc);
                    this.zza.set(Collections.emptyList());
                    return;
                }
                if (TextUtils.isEmpty(null)) {
                    Preconditions.checkNotNull(this.zzd);
                    this.zza.set(zzedVar.zzq(this.zzb, this.zzc, this.zzd));
                } else {
                    this.zza.set(zzedVar.zzr(null, this.zzb, this.zzc));
                }
                this.zze.zzP();
                atomicReference = this.zza;
                atomicReference.notify();
            } finally {
                this.zza.notify();
            }
        }
    }
}
