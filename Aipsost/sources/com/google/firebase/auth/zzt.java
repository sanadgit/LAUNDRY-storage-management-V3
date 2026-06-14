package com.google.firebase.auth;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.internal.p001firebaseauthapi.zzzy;
import com.google.firebase.auth.internal.zzbk;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzt implements zzbk {
    final /* synthetic */ FirebaseAuth zza;

    zzt(FirebaseAuth firebaseAuth) {
        this.zza = firebaseAuth;
    }

    @Override // com.google.firebase.auth.internal.zzg
    public final void zza(zzzy zzzyVar, FirebaseUser firebaseUser) {
        Preconditions.checkNotNull(zzzyVar);
        Preconditions.checkNotNull(firebaseUser);
        firebaseUser.zzh(zzzyVar);
        FirebaseAuth.zzH(this.zza, firebaseUser, zzzyVar, true, true);
    }

    @Override // com.google.firebase.auth.internal.zzao
    public final void zzb(Status status) {
        if (status.getStatusCode() == 17011 || status.getStatusCode() == 17021 || status.getStatusCode() == 17005 || status.getStatusCode() == 17091) {
            this.zza.signOut();
        }
    }
}
