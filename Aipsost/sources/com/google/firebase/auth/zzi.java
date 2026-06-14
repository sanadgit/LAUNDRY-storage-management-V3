package com.google.firebase.auth;

import com.google.android.gms.common.api.Status;
import com.google.firebase.auth.internal.zzan;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzi implements zzan {
    final /* synthetic */ FirebaseUser zza;
    final /* synthetic */ FirebaseAuth zzb;

    zzi(FirebaseAuth firebaseAuth, FirebaseUser firebaseUser) {
        this.zzb = firebaseAuth;
        this.zza = firebaseUser;
    }

    @Override // com.google.firebase.auth.internal.zzan
    public final void zza() {
        FirebaseAuth firebaseAuth = this.zzb;
        if (firebaseAuth.zzf == null || !firebaseAuth.zzf.getUid().equalsIgnoreCase(this.zza.getUid())) {
            return;
        }
        this.zzb.zzD();
    }

    @Override // com.google.firebase.auth.internal.zzao
    public final void zzb(Status status) {
        if (status.getStatusCode() == 17011 || status.getStatusCode() == 17021 || status.getStatusCode() == 17005) {
            this.zzb.signOut();
        }
    }
}
