package com.aipsoft.aipsoftconnect.di;

import android.app.PendingIntent;
import android.content.Context;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes6.dex */
public final class ServiceModule_ProvideMainActivityPendingIntentFactory implements Factory<PendingIntent> {
    private final Provider<Context> appProvider;

    public ServiceModule_ProvideMainActivityPendingIntentFactory(Provider<Context> appProvider) {
        this.appProvider = appProvider;
    }

    @Override // javax.inject.Provider
    public PendingIntent get() {
        return provideMainActivityPendingIntent(this.appProvider.get());
    }

    public static ServiceModule_ProvideMainActivityPendingIntentFactory create(Provider<Context> appProvider) {
        return new ServiceModule_ProvideMainActivityPendingIntentFactory(appProvider);
    }

    public static PendingIntent provideMainActivityPendingIntent(Context app) {
        return (PendingIntent) Preconditions.checkNotNullFromProvides(ServiceModule.INSTANCE.provideMainActivityPendingIntent(app));
    }
}
