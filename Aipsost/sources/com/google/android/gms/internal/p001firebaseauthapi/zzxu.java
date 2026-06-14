package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.PhoneAuthProvider;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzxu implements zzxz {
    final /* synthetic */ PhoneAuthCredential zza;

    zzxu(zzxy zzxyVar, PhoneAuthCredential phoneAuthCredential) {
        this.zza = phoneAuthCredential;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxz
    public final void zza(PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Object... objArr) {
        onVerificationStateChangedCallbacks.onVerificationCompleted(this.zza);
    }
}
