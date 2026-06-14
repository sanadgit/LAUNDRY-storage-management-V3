package com.google.firebase.installations;

import com.google.firebase.FirebaseException;

/* JADX INFO: loaded from: classes11.dex */
public class FirebaseInstallationsException extends FirebaseException {
    private final Status status;

    public enum Status {
        BAD_CONFIG,
        UNAVAILABLE,
        TOO_MANY_REQUESTS
    }

    public FirebaseInstallationsException(Status status) {
        this.status = status;
    }

    public FirebaseInstallationsException(String message, Status status) {
        super(message);
        this.status = status;
    }

    public FirebaseInstallationsException(String message, Status status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public Status getStatus() {
        return this.status;
    }
}
