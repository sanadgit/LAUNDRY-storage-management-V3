package com.google.firebase.auth;

import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class EmailAuthProvider {
    public static final String EMAIL_LINK_SIGN_IN_METHOD = "emailLink";
    public static final String EMAIL_PASSWORD_SIGN_IN_METHOD = "password";
    public static final String PROVIDER_ID = "password";

    private EmailAuthProvider() {
    }

    public static AuthCredential getCredential(String email, String password) {
        Preconditions.checkNotEmpty(email);
        Preconditions.checkNotEmpty(password);
        return new EmailAuthCredential(email, password, null, null, false);
    }

    public static AuthCredential getCredentialWithLink(String email, String emailLink) {
        if (EmailAuthCredential.zzi(emailLink)) {
            return new EmailAuthCredential(email, null, emailLink, null, false);
        }
        throw new IllegalArgumentException("Given link is not a valid email link. Please use FirebaseAuth#isSignInWithEmailLink(String) to determine this before calling this function");
    }
}
