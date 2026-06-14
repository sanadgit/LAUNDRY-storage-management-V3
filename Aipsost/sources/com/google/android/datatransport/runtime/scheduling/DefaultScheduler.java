package com.google.android.datatransport.runtime.scheduling;

import com.google.android.datatransport.TransportScheduleCallback;
import com.google.android.datatransport.runtime.EventInternal;
import com.google.android.datatransport.runtime.TransportContext;
import com.google.android.datatransport.runtime.TransportRuntime;
import com.google.android.datatransport.runtime.backends.BackendRegistry;
import com.google.android.datatransport.runtime.backends.TransportBackend;
import com.google.android.datatransport.runtime.scheduling.jobscheduling.WorkScheduler;
import com.google.android.datatransport.runtime.scheduling.persistence.EventStore;
import com.google.android.datatransport.runtime.synchronization.SynchronizationGuard;
import java.util.concurrent.Executor;
import java.util.logging.Logger;
import javax.inject.Inject;

/* JADX INFO: loaded from: classes.dex */
public class DefaultScheduler implements Scheduler {
    private static final Logger LOGGER = Logger.getLogger(TransportRuntime.class.getName());
    private final BackendRegistry backendRegistry;
    private final EventStore eventStore;
    private final Executor executor;
    private final SynchronizationGuard guard;
    private final WorkScheduler workScheduler;

    @Inject
    public DefaultScheduler(Executor executor, BackendRegistry backendRegistry, WorkScheduler workScheduler, EventStore eventStore, SynchronizationGuard guard) {
        this.executor = executor;
        this.backendRegistry = backendRegistry;
        this.workScheduler = workScheduler;
        this.eventStore = eventStore;
        this.guard = guard;
    }

    @Override // com.google.android.datatransport.runtime.scheduling.Scheduler
    public void schedule(final TransportContext transportContext, final EventInternal event, final TransportScheduleCallback callback) {
        this.executor.execute(new Runnable() { // from class: com.google.android.datatransport.runtime.scheduling.DefaultScheduler$$ExternalSyntheticLambda1
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.m70x41d0caed(transportContext, callback, event);
            }
        });
    }

    /* JADX INFO: renamed from: lambda$schedule$1$com-google-android-datatransport-runtime-scheduling-DefaultScheduler, reason: not valid java name */
    /* synthetic */ void m70x41d0caed(final TransportContext transportContext, TransportScheduleCallback callback, EventInternal event) {
        try {
            TransportBackend transportBackend = this.backendRegistry.get(transportContext.getBackendName());
            if (transportBackend == null) {
                String errorMsg = String.format("Transport backend '%s' is not registered", transportContext.getBackendName());
                LOGGER.warning(errorMsg);
                callback.onSchedule(new IllegalArgumentException(errorMsg));
            } else {
                final EventInternal decoratedEvent = transportBackend.decorate(event);
                this.guard.runCriticalSection(new SynchronizationGuard.CriticalSection() { // from class: com.google.android.datatransport.runtime.scheduling.DefaultScheduler$$ExternalSyntheticLambda0
                    @Override // com.google.android.datatransport.runtime.synchronization.SynchronizationGuard.CriticalSection
                    public final Object execute() {
                        return this.f$0.m69x8f06a4e(transportContext, decoratedEvent);
                    }
                });
                callback.onSchedule(null);
            }
        } catch (Exception e) {
            LOGGER.warning("Error scheduling event " + e.getMessage());
            callback.onSchedule(e);
        }
    }

    /* JADX INFO: renamed from: lambda$schedule$0$com-google-android-datatransport-runtime-scheduling-DefaultScheduler, reason: not valid java name */
    /* synthetic */ Object m69x8f06a4e(TransportContext transportContext, EventInternal decoratedEvent) {
        this.eventStore.persist(transportContext, decoratedEvent);
        this.workScheduler.schedule(transportContext, 1);
        return null;
    }
}
