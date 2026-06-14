package com.google.firebase.auth.internal;

import android.content.Context;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.AuthResult;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzas implements OnSuccessListener {
    final /* synthetic */ TaskCompletionSource zza;
    final /* synthetic */ Context zzb;

    zzas(zzax zzaxVar, TaskCompletionSource taskCompletionSource, Context context) {
        this.zza = taskCompletionSource;
        this.zzb = context;
    }

    @Override // com.google.android.gms.tasks.OnSuccessListener
    public final /* bridge */ /* synthetic */ void onSuccess(Object obj) {
        this.zza.setResult((AuthResult) obj);
        zzax.zze(this.zzb);
    }
}
