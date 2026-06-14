package com.aipsoft.aipsoftconnect.di;

import android.content.Context;
import com.google.android.gms.location.FusedLocationProviderClient;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes6.dex */
public final class ServiceModule_ProvideFusedLocationProvidedClientFactory implements Factory<FusedLocationProviderClient> {
    private final Provider<Context> appProvider;

    public ServiceModule_ProvideFusedLocationProvidedClientFactory(Provider<Context> appProvider) {
        this.appProvider = appProvider;
    }

    @Override // javax.inject.Provider
    public FusedLocationProviderClient get() {
        return provideFusedLocationProvidedClient(this.appProvider.get());
    }

    public static ServiceModule_ProvideFusedLocationProvidedClientFactory create(Provider<Context> appProvider) {
        return new ServiceModule_ProvideFusedLocationProvidedClientFactory(appProvider);
    }

    public static FusedLocationProviderClient provideFusedLocationProvidedClient(Context app) {
        return (FusedLocationProviderClient) Preconditions.checkNotNullFromProvides(ServiceModule.INSTANCE.provideFusedLocationProvidedClient(app));
    }
}
