package com.google.firebase.auth.internal;

import android.util.Log;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.TaskCompletionSource;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzc implements OnFailureListener {
    final /* synthetic */ TaskCompletionSource zza;

    zzc(zzf zzfVar, TaskCompletionSource taskCompletionSource) {
        this.zza = taskCompletionSource;
    }

    @Override // com.google.android.gms.tasks.OnFailureListener
    public final void onFailure(Exception exc) {
        Log.e(zzf.zza, String.format("Failed to get reCAPTCHA token with error [%s]- calling backend without app verification", exc.getMessage()));
        this.zza.setResult(new zze(null, null));
    }
}
