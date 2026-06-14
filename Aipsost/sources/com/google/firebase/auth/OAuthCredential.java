package com.google.firebase.auth;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class OAuthCredential extends AuthCredential {
    public abstract String getAccessToken();

    public abstract String getIdToken();

    public abstract String getSecret();
}
