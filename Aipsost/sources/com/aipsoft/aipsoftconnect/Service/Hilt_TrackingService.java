package com.aipsoft.aipsoftconnect.Service;

import androidx.lifecycle.LifecycleService;
import dagger.hilt.android.internal.managers.ServiceComponentManager;
import dagger.hilt.internal.GeneratedComponentManagerHolder;
import dagger.hilt.internal.UnsafeCasts;

/* JADX INFO: loaded from: classes6.dex */
public abstract class Hilt_TrackingService extends LifecycleService implements GeneratedComponentManagerHolder {
    private volatile ServiceComponentManager componentManager;
    private final Object componentManagerLock = new Object();
    private boolean injected = false;

    Hilt_TrackingService() {
    }

    @Override // androidx.lifecycle.LifecycleService, android.app.Service
    public void onCreate() {
        inject();
        super.onCreate();
    }

    protected ServiceComponentManager createComponentManager() {
        return new ServiceComponentManager(this);
    }

    @Override // dagger.hilt.internal.GeneratedComponentManagerHolder
    public final ServiceComponentManager componentManager() {
        if (this.componentManager == null) {
            synchronized (this.componentManagerLock) {
                if (this.componentManager == null) {
                    this.componentManager = createComponentManager();
                }
            }
        }
        return this.componentManager;
    }

    protected void inject() {
        if (!this.injected) {
            this.injected = true;
            ((TrackingService_GeneratedInjector) generatedComponent()).injectTrackingService((TrackingService) UnsafeCasts.unsafeCast(this));
        }
    }

    @Override // dagger.hilt.internal.GeneratedComponentManager
    public final Object generatedComponent() {
        return componentManager().generatedComponent();
    }
}
