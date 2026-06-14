package com.google.android.gms.measurement.internal;

import android.content.Context;
import android.content.Intent;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzff {
    private final zza zza;

    /* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
    public interface zza {
        void doStartService(Context context, Intent intent);
    }

    public zzff(zza zzaVar) {
        Preconditions.checkNotNull(zzaVar);
        this.zza = zzaVar;
    }

    public final void zza(Context context, Intent intent) {
        zzfu zzfuVarZzC = zzfu.zzC(context, null, null);
        zzem zzemVarZzau = zzfuVarZzC.zzau();
        if (intent == null) {
            zzemVarZzau.zze().zza("Receiver called with null intent");
            return;
        }
        zzfuVarZzC.zzat();
        String action = intent.getAction();
        zzemVarZzau.zzk().zzb("Local receiver got", action);
        if (!"com.google.android.gms.measurement.UPLOAD".equals(action)) {
            if ("com.android.vending.INSTALL_REFERRER".equals(action)) {
                zzemVarZzau.zze().zza("Install Referrer Broadcasts are deprecated");
            }
        } else {
            Intent className = new Intent().setClassName(context, "com.google.android.gms.measurement.AppMeasurementService");
            className.setAction("com.google.android.gms.measurement.UPLOAD");
            zzemVarZzau.zzk().zza("Starting wakeful intent.");
            this.zza.doStartService(context, className);
        }
    }
}
