package com.google.android.datatransport.runtime.scheduling.jobscheduling;

import com.google.android.datatransport.runtime.TransportContext;
import com.google.android.datatransport.runtime.scheduling.persistence.EventStore;
import com.google.android.datatransport.runtime.synchronization.SynchronizationGuard;
import java.util.concurrent.Executor;
import javax.inject.Inject;

/* JADX INFO: loaded from: classes.dex */
public class WorkInitializer {
    private final Executor executor;
    private final SynchronizationGuard guard;
    private final WorkScheduler scheduler;
    private final EventStore store;

    @Inject
    WorkInitializer(Executor executor, EventStore store, WorkScheduler scheduler, SynchronizationGuard guard) {
        this.executor = executor;
        this.store = store;
        this.scheduler = scheduler;
        this.guard = guard;
    }

    public void ensureContextsScheduled() {
        this.executor.execute(new Runnable() { // from class: com.google.android.datatransport.runtime.scheduling.jobscheduling.WorkInitializer$$ExternalSyntheticLambda1
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.m77xb85b87dc();
            }
        });
    }

    /* JADX INFO: renamed from: lambda$ensureContextsScheduled$1$com-google-android-datatransport-runtime-scheduling-jobscheduling-WorkInitializer, reason: not valid java name */
    /* synthetic */ void m77xb85b87dc() {
        this.guard.runCriticalSection(new SynchronizationGuard.CriticalSection() { // from class: com.google.android.datatransport.runtime.scheduling.jobscheduling.WorkInitializer$$ExternalSyntheticLambda0
            @Override // com.google.android.datatransport.runtime.synchronization.SynchronizationGuard.CriticalSection
            public final Object execute() {
                return this.f$0.m76x10dfae1b();
            }
        });
    }

    /* JADX INFO: renamed from: lambda$ensureContextsScheduled$0$com-google-android-datatransport-runtime-scheduling-jobscheduling-WorkInitializer, reason: not valid java name */
    /* synthetic */ Object m76x10dfae1b() {
        for (TransportContext context : this.store.loadActiveContexts()) {
            this.scheduler.schedule(context, 1);
        }
        return null;
    }
}
