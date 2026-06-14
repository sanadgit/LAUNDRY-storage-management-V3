package com.google.firebase.auth;

import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class AuthCredential extends AbstractSafeParcelable {
    AuthCredential() {
    }

    public abstract String getProvider();

    public abstract String getSignInMethod();

    public abstract AuthCredential zza();
}
