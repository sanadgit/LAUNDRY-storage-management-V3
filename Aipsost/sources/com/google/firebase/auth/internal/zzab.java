package com.google.firebase.auth.internal;

import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.auth.GetTokenResult;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzab implements Continuation {
    zzab(zzac zzacVar) {
    }

    @Override // com.google.android.gms.tasks.Continuation
    public final /* bridge */ /* synthetic */ Object then(Task task) throws Exception {
        return !task.isSuccessful() ? Tasks.forException(task.getException()) : Tasks.forResult(zzag.zza(((GetTokenResult) task.getResult()).getToken()));
    }
}
