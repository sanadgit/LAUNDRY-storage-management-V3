package com.google.firebase.auth;

import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.internal.p001firebaseauthapi.zzzy;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
class zzs implements com.google.firebase.auth.internal.zzg {
    final /* synthetic */ FirebaseAuth zza;

    zzs(FirebaseAuth firebaseAuth) {
        this.zza = firebaseAuth;
    }

    @Override // com.google.firebase.auth.internal.zzg
    public final void zza(zzzy zzzyVar, FirebaseUser firebaseUser) {
        Preconditions.checkNotNull(zzzyVar);
        Preconditions.checkNotNull(firebaseUser);
        firebaseUser.zzh(zzzyVar);
        this.zza.zzE(firebaseUser, zzzyVar, true);
    }
}
