package com.aipsoft.aipsoftconnect.di;

import android.app.PendingIntent;
import android.content.Context;
import androidx.core.app.NotificationCompat;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes6.dex */
public final class ServiceModule_ProvideBaseNotificationBuilderFactory implements Factory<NotificationCompat.Builder> {
    private final Provider<Context> appProvider;
    private final Provider<PendingIntent> pendingIntentProvider;

    public ServiceModule_ProvideBaseNotificationBuilderFactory(Provider<Context> appProvider, Provider<PendingIntent> pendingIntentProvider) {
        this.appProvider = appProvider;
        this.pendingIntentProvider = pendingIntentProvider;
    }

    @Override // javax.inject.Provider
    public NotificationCompat.Builder get() {
        return provideBaseNotificationBuilder(this.appProvider.get(), this.pendingIntentProvider.get());
    }

    public static ServiceModule_ProvideBaseNotificationBuilderFactory create(Provider<Context> appProvider, Provider<PendingIntent> pendingIntentProvider) {
        return new ServiceModule_ProvideBaseNotificationBuilderFactory(appProvider, pendingIntentProvider);
    }

    public static NotificationCompat.Builder provideBaseNotificationBuilder(Context app, PendingIntent pendingIntent) {
        return (NotificationCompat.Builder) Preconditions.checkNotNullFromProvides(ServiceModule.INSTANCE.provideBaseNotificationBuilder(app, pendingIntent));
    }
}
