package com.google.firebase.auth;

import com.google.firebase.auth.FirebaseAuth;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzk implements Runnable {
    final /* synthetic */ FirebaseAuth.AuthStateListener zza;
    final /* synthetic */ FirebaseAuth zzb;

    zzk(FirebaseAuth firebaseAuth, FirebaseAuth.AuthStateListener authStateListener) {
        this.zzb = firebaseAuth;
        this.zza = authStateListener;
    }

    @Override // java.lang.Runnable
    public final void run() {
        this.zza.onAuthStateChanged(this.zzb);
    }
}
