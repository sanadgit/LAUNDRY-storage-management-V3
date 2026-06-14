package com.bumptech.glide.manager;

/* JADX INFO: loaded from: classes.dex */
class ApplicationLifecycle implements Lifecycle {
    ApplicationLifecycle() {
    }

    @Override // com.bumptech.glide.manager.Lifecycle
    public void addListener(LifecycleListener listener) {
        listener.onStart();
    }

    @Override // com.bumptech.glide.manager.Lifecycle
    public void removeListener(LifecycleListener listener) {
    }
}
