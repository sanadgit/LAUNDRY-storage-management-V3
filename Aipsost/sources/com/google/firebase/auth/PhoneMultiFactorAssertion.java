package com.google.firebase.auth;

import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class PhoneMultiFactorAssertion extends MultiFactorAssertion {
    private final PhoneAuthCredential zza;

    public PhoneMultiFactorAssertion(PhoneAuthCredential phoneAuthCredential) {
        Preconditions.checkNotNull(phoneAuthCredential);
        this.zza = phoneAuthCredential;
    }

    @Override // com.google.firebase.auth.MultiFactorAssertion
    public String getFactorId() {
        return "phone";
    }

    public final PhoneAuthCredential zza() {
        return this.zza;
    }
}
