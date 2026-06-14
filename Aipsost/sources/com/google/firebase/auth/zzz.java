package com.google.firebase.auth;

import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.Task;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzz implements Continuation {
    final /* synthetic */ ActionCodeSettings zza;
    final /* synthetic */ FirebaseUser zzb;

    zzz(FirebaseUser firebaseUser, ActionCodeSettings actionCodeSettings) {
        this.zzb = firebaseUser;
        this.zza = actionCodeSettings;
    }

    @Override // com.google.android.gms.tasks.Continuation
    public final /* bridge */ /* synthetic */ Object then(Task task) throws Exception {
        return FirebaseAuth.getInstance(this.zzb.zza()).zzi(this.zza, (String) Preconditions.checkNotNull(((GetTokenResult) task.getResult()).getToken()));
    }
}
