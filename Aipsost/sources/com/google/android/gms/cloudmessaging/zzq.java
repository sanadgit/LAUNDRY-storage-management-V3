package com.google.android.gms.cloudmessaging;

import android.os.Bundle;
import android.util.Log;
import com.google.android.gms.tasks.TaskCompletionSource;

/* JADX INFO: compiled from: com.google.android.gms:play-services-cloud-messaging@@16.0.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzq<T> {
    final int zza;
    final TaskCompletionSource<T> zzb = new TaskCompletionSource<>();
    final int zzc;
    final Bundle zzd;

    zzq(int i, int i2, Bundle bundle) {
        this.zza = i;
        this.zzc = i2;
        this.zzd = bundle;
    }

    abstract void zza(Bundle bundle);

    abstract boolean zza();

    final void zza(T t) {
        if (Log.isLoggable("MessengerIpcClient", 3)) {
            String strValueOf = String.valueOf(this);
            String strValueOf2 = String.valueOf(t);
            Log.d("MessengerIpcClient", new StringBuilder(String.valueOf(strValueOf).length() + 16 + String.valueOf(strValueOf2).length()).append("Finishing ").append(strValueOf).append(" with ").append(strValueOf2).toString());
        }
        this.zzb.setResult(t);
    }

    final void zza(zzp zzpVar) {
        if (Log.isLoggable("MessengerIpcClient", 3)) {
            String strValueOf = String.valueOf(this);
            String strValueOf2 = String.valueOf(zzpVar);
            Log.d("MessengerIpcClient", new StringBuilder(String.valueOf(strValueOf).length() + 14 + String.valueOf(strValueOf2).length()).append("Failing ").append(strValueOf).append(" with ").append(strValueOf2).toString());
        }
        this.zzb.setException(zzpVar);
    }

    public String toString() {
        int i = this.zzc;
        int i2 = this.zza;
        return new StringBuilder(55).append("Request { what=").append(i).append(" id=").append(i2).append(" oneWay=").append(zza()).append("}").toString();
    }
}
