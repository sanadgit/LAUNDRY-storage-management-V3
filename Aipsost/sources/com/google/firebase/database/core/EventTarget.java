package com.google.firebase.database.core;

/* JADX INFO: loaded from: classes11.dex */
public interface EventTarget {
    void postEvent(Runnable runnable);

    void restart();

    void shutdown();
}
