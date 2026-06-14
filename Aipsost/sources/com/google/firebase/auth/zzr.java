package com.google.firebase.auth;

import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzr implements Continuation {
    zzr(FirebaseAuth firebaseAuth) {
    }

    @Override // com.google.android.gms.tasks.Continuation
    public final /* bridge */ /* synthetic */ Object then(Task task) throws Exception {
        return (!task.isSuccessful() && (task.getException() instanceof FirebaseAuthException) && ((FirebaseAuthException) task.getException()).getErrorCode().equals("ERROR_INTERNAL_SUCCESS_SIGN_OUT")) ? Tasks.forResult(null) : task;
    }
}
