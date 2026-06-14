package com.google.firebase.tracing;

import android.os.Trace;

/* JADX INFO: loaded from: classes11.dex */
public final class FirebaseTrace {
    private FirebaseTrace() {
    }

    public static void pushTrace(String name) {
        Trace.beginSection(name);
    }

    public static void popTrace() {
        Trace.endSection();
    }
}
