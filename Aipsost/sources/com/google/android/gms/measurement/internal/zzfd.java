package com.google.android.gms.measurement.internal;

import android.content.ComponentName;
import android.content.ServiceConnection;
import android.os.IBinder;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfd implements ServiceConnection {
    final /* synthetic */ zzfe zza;
    private final String zzb;

    zzfd(zzfe zzfeVar, String str) {
        this.zza = zzfeVar;
        this.zzb = str;
    }

    @Override // android.content.ServiceConnection
    public final void onServiceConnected(ComponentName componentName, IBinder iBinder) {
        if (iBinder == null) {
            this.zza.zza.zzau().zze().zza("Install Referrer connection returned with null binder");
            return;
        }
        try {
            com.google.android.gms.internal.measurement.zzbr zzbrVarZzb = com.google.android.gms.internal.measurement.zzbq.zzb(iBinder);
            if (zzbrVarZzb == null) {
                this.zza.zza.zzau().zze().zza("Install Referrer Service implementation was not found");
            } else {
                this.zza.zza.zzau().zzk().zza("Install Referrer Service connected");
                this.zza.zza.zzav().zzh(new zzfc(this, zzbrVarZzb, this));
            }
        } catch (RuntimeException e) {
            this.zza.zza.zzau().zze().zzb("Exception occurred while calling Install Referrer API", e);
        }
    }

    @Override // android.content.ServiceConnection
    public final void onServiceDisconnected(ComponentName componentName) {
        this.zza.zza.zzau().zzk().zza("Install Referrer Service disconnected");
    }
}
