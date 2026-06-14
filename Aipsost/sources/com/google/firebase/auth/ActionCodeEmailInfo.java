package com.google.firebase.auth;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class ActionCodeEmailInfo extends ActionCodeInfo {
    @Override // com.google.firebase.auth.ActionCodeInfo
    public String getEmail() {
        return super.getEmail();
    }

    public abstract String getPreviousEmail();
}
