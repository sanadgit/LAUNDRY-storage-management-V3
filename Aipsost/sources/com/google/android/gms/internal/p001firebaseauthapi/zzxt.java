package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.PhoneAuthProvider;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzxt implements zzxz {
    final /* synthetic */ String zza;

    zzxt(zzxy zzxyVar, String str) {
        this.zza = str;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxz
    public final void zza(PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Object... objArr) {
        onVerificationStateChangedCallbacks.onCodeSent(this.zza, PhoneAuthProvider.ForceResendingToken.zza());
    }
}
