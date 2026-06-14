package com.aipsoft.aipsoftconnect.Service;

import androidx.core.app.NotificationCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import dagger.MembersInjector;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes6.dex */
public final class TrackingService_MembersInjector implements MembersInjector<TrackingService> {
    private final Provider<NotificationCompat.Builder> baseNotificationBuilderProvider;
    private final Provider<FusedLocationProviderClient> fusedLocationProviderClientProvider;

    public TrackingService_MembersInjector(Provider<FusedLocationProviderClient> fusedLocationProviderClientProvider, Provider<NotificationCompat.Builder> baseNotificationBuilderProvider) {
        this.fusedLocationProviderClientProvider = fusedLocationProviderClientProvider;
        this.baseNotificationBuilderProvider = baseNotificationBuilderProvider;
    }

    public static MembersInjector<TrackingService> create(Provider<FusedLocationProviderClient> fusedLocationProviderClientProvider, Provider<NotificationCompat.Builder> baseNotificationBuilderProvider) {
        return new TrackingService_MembersInjector(fusedLocationProviderClientProvider, baseNotificationBuilderProvider);
    }

    @Override // dagger.MembersInjector
    public void injectMembers(TrackingService instance) {
        injectFusedLocationProviderClient(instance, this.fusedLocationProviderClientProvider.get());
        injectBaseNotificationBuilder(instance, this.baseNotificationBuilderProvider.get());
    }

    public static void injectFusedLocationProviderClient(TrackingService instance, FusedLocationProviderClient fusedLocationProviderClient) {
        instance.fusedLocationProviderClient = fusedLocationProviderClient;
    }

    public static void injectBaseNotificationBuilder(TrackingService instance, NotificationCompat.Builder baseNotificationBuilder) {
        instance.baseNotificationBuilder = baseNotificationBuilder;
    }
}
