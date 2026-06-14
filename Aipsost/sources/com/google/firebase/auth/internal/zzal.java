package com.google.firebase.auth.internal;

import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzal implements Runnable {
    final /* synthetic */ zzam zza;
    private final String zzb;

    zzal(zzam zzamVar, String str) {
        this.zza = zzamVar;
        this.zzb = Preconditions.checkNotEmpty(str);
    }

    @Override // java.lang.Runnable
    public final void run() {
        FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(FirebaseApp.getInstance(this.zzb));
        if (firebaseAuth.getCurrentUser() != null) {
            Task accessToken = firebaseAuth.getAccessToken(true);
            zzam.zzg.v("Token refreshing started", new Object[0]);
            accessToken.addOnFailureListener(new zzak(this));
        }
    }
}
