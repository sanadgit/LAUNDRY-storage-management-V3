package com.google.android.datatransport.runtime.scheduling.jobscheduling;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import com.google.android.datatransport.runtime.EventInternal;
import com.google.android.datatransport.runtime.TransportContext;
import com.google.android.datatransport.runtime.backends.BackendRegistry;
import com.google.android.datatransport.runtime.backends.BackendRequest;
import com.google.android.datatransport.runtime.backends.BackendResponse;
import com.google.android.datatransport.runtime.backends.TransportBackend;
import com.google.android.datatransport.runtime.logging.Logging;
import com.google.android.datatransport.runtime.scheduling.persistence.EventStore;
import com.google.android.datatransport.runtime.scheduling.persistence.PersistedEvent;
import com.google.android.datatransport.runtime.synchronization.SynchronizationException;
import com.google.android.datatransport.runtime.synchronization.SynchronizationGuard;
import com.google.android.datatransport.runtime.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.Executor;
import javax.inject.Inject;

/* JADX INFO: loaded from: classes.dex */
public class Uploader {
    private static final String LOG_TAG = "Uploader";
    private final BackendRegistry backendRegistry;
    private final Clock clock;
    private final Context context;
    private final EventStore eventStore;
    private final Executor executor;
    private final SynchronizationGuard guard;
    private final WorkScheduler workScheduler;

    @Inject
    public Uploader(Context context, BackendRegistry backendRegistry, EventStore eventStore, WorkScheduler workScheduler, Executor executor, SynchronizationGuard guard, Clock clock) {
        this.context = context;
        this.backendRegistry = backendRegistry;
        this.eventStore = eventStore;
        this.workScheduler = workScheduler;
        this.executor = executor;
        this.guard = guard;
        this.clock = clock;
    }

    boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager = (ConnectivityManager) this.context.getSystemService("connectivity");
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }

    public void upload(final TransportContext transportContext, final int attemptNumber, final Runnable callback) {
        this.executor.execute(new Runnable() { // from class: com.google.android.datatransport.runtime.scheduling.jobscheduling.Uploader$$ExternalSyntheticLambda0
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.m75x80c37673(transportContext, attemptNumber, callback);
            }
        });
    }

    /* JADX INFO: renamed from: lambda$upload$1$com-google-android-datatransport-runtime-scheduling-jobscheduling-Uploader, reason: not valid java name */
    /* synthetic */ void m75x80c37673(final TransportContext transportContext, final int attemptNumber, Runnable callback) {
        try {
            try {
                SynchronizationGuard synchronizationGuard = this.guard;
                final EventStore eventStore = this.eventStore;
                Objects.requireNonNull(eventStore);
                synchronizationGuard.runCriticalSection(new SynchronizationGuard.CriticalSection() { // from class: com.google.android.datatransport.runtime.scheduling.jobscheduling.Uploader$$ExternalSyntheticLambda1
                    @Override // com.google.android.datatransport.runtime.synchronization.SynchronizationGuard.CriticalSection
                    public final Object execute() {
                        return Integer.valueOf(eventStore.cleanUp());
                    }
                });
                if (!isNetworkAvailable()) {
                    this.guard.runCriticalSection(new SynchronizationGuard.CriticalSection() { // from class: com.google.android.datatransport.runtime.scheduling.jobscheduling.Uploader$$ExternalSyntheticLambda2
                        @Override // com.google.android.datatransport.runtime.synchronization.SynchronizationGuard.CriticalSection
                        public final Object execute() {
                            return this.f$0.m74x3eac4914(transportContext, attemptNumber);
                        }
                    });
                } else {
                    logAndUpdateState(transportContext, attemptNumber);
                }
            } catch (SynchronizationException e) {
                this.workScheduler.schedule(transportContext, attemptNumber + 1);
            }
        } finally {
            callback.run();
        }
    }

    /* JADX INFO: renamed from: lambda$upload$0$com-google-android-datatransport-runtime-scheduling-jobscheduling-Uploader, reason: not valid java name */
    /* synthetic */ Object m74x3eac4914(TransportContext transportContext, int attemptNumber) {
        this.workScheduler.schedule(transportContext, attemptNumber + 1);
        return null;
    }

    void logAndUpdateState(final TransportContext transportContext, final int attemptNumber) {
        BackendResponse response;
        TransportBackend backend = this.backendRegistry.get(transportContext.getBackendName());
        final Iterable<PersistedEvent> persistedEvents = (Iterable) this.guard.runCriticalSection(new SynchronizationGuard.CriticalSection() { // from class: com.google.android.datatransport.runtime.scheduling.jobscheduling.Uploader$$ExternalSyntheticLambda3
            @Override // com.google.android.datatransport.runtime.synchronization.SynchronizationGuard.CriticalSection
            public final Object execute() {
                return this.f$0.m72x65f78bd8(transportContext);
            }
        });
        if (!persistedEvents.iterator().hasNext()) {
            return;
        }
        if (backend == null) {
            Logging.d(LOG_TAG, "Unknown backend for %s, deleting event batch for it...", transportContext);
            response = BackendResponse.fatalError();
        } else {
            List<EventInternal> eventInternals = new ArrayList<>();
            for (PersistedEvent persistedEvent : persistedEvents) {
                eventInternals.add(persistedEvent.getEvent());
            }
            response = backend.send(BackendRequest.builder().setEvents(eventInternals).setExtras(transportContext.getExtras()).build());
        }
        final BackendResponse backendResponse = response;
        this.guard.runCriticalSection(new SynchronizationGuard.CriticalSection() { // from class: com.google.android.datatransport.runtime.scheduling.jobscheduling.Uploader$$ExternalSyntheticLambda4
            @Override // com.google.android.datatransport.runtime.synchronization.SynchronizationGuard.CriticalSection
            public final Object execute() {
                return this.f$0.m73xa80eb937(backendResponse, persistedEvents, transportContext, attemptNumber);
            }
        });
    }

    /* JADX INFO: renamed from: lambda$logAndUpdateState$2$com-google-android-datatransport-runtime-scheduling-jobscheduling-Uploader, reason: not valid java name */
    /* synthetic */ Iterable m72x65f78bd8(TransportContext transportContext) {
        return this.eventStore.loadBatch(transportContext);
    }

    /* JADX INFO: renamed from: lambda$logAndUpdateState$3$com-google-android-datatransport-runtime-scheduling-jobscheduling-Uploader, reason: not valid java name */
    /* synthetic */ Object m73xa80eb937(BackendResponse response, Iterable persistedEvents, TransportContext transportContext, int attemptNumber) {
        if (response.getStatus() == BackendResponse.Status.TRANSIENT_ERROR) {
            this.eventStore.recordFailure(persistedEvents);
            this.workScheduler.schedule(transportContext, attemptNumber + 1);
            return null;
        }
        this.eventStore.recordSuccess(persistedEvents);
        if (response.getStatus() == BackendResponse.Status.OK) {
            this.eventStore.recordNextCallTime(transportContext, this.clock.getTime() + response.getNextRequestWaitMillis());
        }
        if (this.eventStore.hasPendingEventsFor(transportContext)) {
            this.workScheduler.schedule(transportContext, 1, true);
            return null;
        }
        return null;
    }
}
