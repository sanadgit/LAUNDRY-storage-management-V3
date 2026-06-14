package com.google.firebase.auth;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public interface ActionCodeResult {
    public static final int EMAIL = 0;
    public static final int ERROR = 3;
    public static final int FROM_EMAIL = 1;
    public static final int PASSWORD_RESET = 0;
    public static final int RECOVER_EMAIL = 2;
    public static final int REVERT_SECOND_FACTOR_ADDITION = 6;
    public static final int SIGN_IN_WITH_EMAIL_LINK = 4;
    public static final int VERIFY_BEFORE_CHANGE_EMAIL = 5;
    public static final int VERIFY_EMAIL = 1;

    /* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
    @Retention(RetentionPolicy.SOURCE)
    public @interface ActionDataKey {
    }

    /* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
    @Retention(RetentionPolicy.SOURCE)
    public @interface Operation {
    }

    @Deprecated
    String getData(int i);

    ActionCodeInfo getInfo();

    int getOperation();
}
