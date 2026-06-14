package com.google.android.datatransport.runtime.scheduling.persistence;

import com.google.android.datatransport.runtime.dagger.internal.Factory;
import com.google.android.datatransport.runtime.time.Clock;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes.dex */
public final class SQLiteEventStore_Factory implements Factory<SQLiteEventStore> {
    private final Provider<Clock> clockProvider;
    private final Provider<EventStoreConfig> configProvider;
    private final Provider<SchemaManager> schemaManagerProvider;
    private final Provider<Clock> wallClockProvider;

    public SQLiteEventStore_Factory(Provider<Clock> wallClockProvider, Provider<Clock> clockProvider, Provider<EventStoreConfig> configProvider, Provider<SchemaManager> schemaManagerProvider) {
        this.wallClockProvider = wallClockProvider;
        this.clockProvider = clockProvider;
        this.configProvider = configProvider;
        this.schemaManagerProvider = schemaManagerProvider;
    }

    @Override // javax.inject.Provider
    public SQLiteEventStore get() {
        return newInstance(this.wallClockProvider.get(), this.clockProvider.get(), this.configProvider.get(), this.schemaManagerProvider.get());
    }

    public static SQLiteEventStore_Factory create(Provider<Clock> wallClockProvider, Provider<Clock> clockProvider, Provider<EventStoreConfig> configProvider, Provider<SchemaManager> schemaManagerProvider) {
        return new SQLiteEventStore_Factory(wallClockProvider, clockProvider, configProvider, schemaManagerProvider);
    }

    public static SQLiteEventStore newInstance(Clock wallClock, Clock clock, Object config, Object schemaManager) {
        return new SQLiteEventStore(wallClock, clock, (EventStoreConfig) config, (SchemaManager) schemaManager);
    }
}
