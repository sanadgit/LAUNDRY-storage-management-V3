package com.google.firebase.auth.internal;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.firebase.FirebaseNetworkException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzak implements OnFailureListener {
    final /* synthetic */ zzal zza;

    zzak(zzal zzalVar) {
        this.zza = zzalVar;
    }

    @Override // com.google.android.gms.tasks.OnFailureListener
    public final void onFailure(Exception exc) {
        if (exc instanceof FirebaseNetworkException) {
            zzam.zzg.v("Failure to refresh token; scheduling refresh after failure", new Object[0]);
            this.zza.zza.zzd();
        }
    }
}
