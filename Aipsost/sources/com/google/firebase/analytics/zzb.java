package com.google.firebase.analytics;

import java.util.concurrent.Callable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzb implements Callable<String> {
    final /* synthetic */ FirebaseAnalytics zza;

    zzb(FirebaseAnalytics firebaseAnalytics) {
        this.zza = firebaseAnalytics;
    }

    @Override // java.util.concurrent.Callable
    public final /* bridge */ /* synthetic */ String call() throws Exception {
        return this.zza.zzb.zzF();
    }
}
