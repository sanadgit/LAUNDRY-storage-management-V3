package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.tasks.OnFailureListener;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzyr implements OnFailureListener {
    zzyr(zzyv zzyvVar) {
    }

    @Override // com.google.android.gms.tasks.OnFailureListener
    public final void onFailure(Exception exc) {
        zzyv.zza.e("SmsRetrieverClient failed to start: ".concat(String.valueOf(exc.getMessage())), new Object[0]);
    }
}
