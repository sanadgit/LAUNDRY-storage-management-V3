package com.google.firebase.messaging;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;
import com.google.android.gms.common.stats.ConnectionTracker;
import com.google.android.gms.common.util.concurrent.NamedThreadFactory;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.messaging.WithinAppServiceConnection;
import java.util.ArrayDeque;
import java.util.Queue;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
class WithinAppServiceConnection implements ServiceConnection {
    private WithinAppServiceBinder binder;
    private boolean connectionInProgress;
    private final Intent connectionIntent;
    private final Context context;
    private final Queue<BindRequest> intentQueue;
    private final ScheduledExecutorService scheduledExecutorService;

    /* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
    static class BindRequest {
        final Intent intent;
        private final TaskCompletionSource<Void> taskCompletionSource = new TaskCompletionSource<>();

        BindRequest(Intent intent) {
            this.intent = intent;
        }

        void arrangeTimeout(ScheduledExecutorService scheduledExecutorService) {
            final ScheduledFuture<?> scheduledFutureSchedule = scheduledExecutorService.schedule(new Runnable(this) { // from class: com.google.firebase.messaging.WithinAppServiceConnection$BindRequest$$Lambda$0
                private final WithinAppServiceConnection.BindRequest arg$1;

                {
                    this.arg$1 = this;
                }

                @Override // java.lang.Runnable
                public void run() {
                    this.arg$1.lambda$arrangeTimeout$0$WithinAppServiceConnection$BindRequest();
                }
            }, 9000L, TimeUnit.MILLISECONDS);
            getTask().addOnCompleteListener(scheduledExecutorService, new OnCompleteListener(scheduledFutureSchedule) { // from class: com.google.firebase.messaging.WithinAppServiceConnection$BindRequest$$Lambda$1
                private final ScheduledFuture arg$1;

                {
                    this.arg$1 = scheduledFutureSchedule;
                }

                @Override // com.google.android.gms.tasks.OnCompleteListener
                public void onComplete(Task task) {
                    this.arg$1.cancel(false);
                }
            });
        }

        /* JADX INFO: Access modifiers changed from: package-private */
        public void finish() {
            this.taskCompletionSource.trySetResult(null);
        }

        Task<Void> getTask() {
            return this.taskCompletionSource.getTask();
        }

        final /* synthetic */ void lambda$arrangeTimeout$0$WithinAppServiceConnection$BindRequest() {
            String action = this.intent.getAction();
            StringBuilder sb = new StringBuilder(String.valueOf(action).length() + 61);
            sb.append("Service took too long to process intent: ");
            sb.append(action);
            sb.append(" App may get closed.");
            Log.w(Constants.TAG, sb.toString());
            finish();
        }
    }

    WithinAppServiceConnection(Context context, String str) {
        this(context, "com.google.firebase.MESSAGING_EVENT", new ScheduledThreadPoolExecutor(0, new NamedThreadFactory("Firebase-FirebaseInstanceIdServiceConnection")));
    }

    private void finishAllInQueue() {
        while (!this.intentQueue.isEmpty()) {
            this.intentQueue.poll().finish();
        }
    }

    private synchronized void flushQueue() {
        if (Log.isLoggable(Constants.TAG, 3)) {
            Log.d(Constants.TAG, "flush queue called");
        }
        while (!this.intentQueue.isEmpty()) {
            if (Log.isLoggable(Constants.TAG, 3)) {
                Log.d(Constants.TAG, "found intent to be delivered");
            }
            WithinAppServiceBinder withinAppServiceBinder = this.binder;
            if (withinAppServiceBinder == null || !withinAppServiceBinder.isBinderAlive()) {
                startConnectionIfNeeded();
                break;
            }
            if (Log.isLoggable(Constants.TAG, 3)) {
                Log.d(Constants.TAG, "binder is alive, sending the intent.");
            }
            this.binder.send(this.intentQueue.poll());
        }
    }

    private void startConnectionIfNeeded() {
        if (Log.isLoggable(Constants.TAG, 3)) {
            boolean z = this.connectionInProgress;
            StringBuilder sb = new StringBuilder(39);
            sb.append("binder is dead. start connection? ");
            sb.append(!z);
            Log.d(Constants.TAG, sb.toString());
        }
        if (this.connectionInProgress) {
            return;
        }
        this.connectionInProgress = true;
        try {
            if (ConnectionTracker.getInstance().bindService(this.context, this.connectionIntent, this, 65)) {
                return;
            } else {
                Log.e(Constants.TAG, "binding to the service failed");
            }
        } catch (SecurityException e) {
            Log.e(Constants.TAG, "Exception while binding the service", e);
        }
        this.connectionInProgress = false;
        finishAllInQueue();
    }

    @Override // android.content.ServiceConnection
    public synchronized void onServiceConnected(ComponentName componentName, IBinder iBinder) {
        if (Log.isLoggable(Constants.TAG, 3)) {
            String strValueOf = String.valueOf(componentName);
            StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 20);
            sb.append("onServiceConnected: ");
            sb.append(strValueOf);
            Log.d(Constants.TAG, sb.toString());
        }
        this.connectionInProgress = false;
        if (iBinder instanceof WithinAppServiceBinder) {
            this.binder = (WithinAppServiceBinder) iBinder;
            flushQueue();
            return;
        }
        String strValueOf2 = String.valueOf(iBinder);
        StringBuilder sb2 = new StringBuilder(String.valueOf(strValueOf2).length() + 28);
        sb2.append("Invalid service connection: ");
        sb2.append(strValueOf2);
        Log.e(Constants.TAG, sb2.toString());
        finishAllInQueue();
    }

    @Override // android.content.ServiceConnection
    public void onServiceDisconnected(ComponentName componentName) {
        if (Log.isLoggable(Constants.TAG, 3)) {
            String strValueOf = String.valueOf(componentName);
            StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 23);
            sb.append("onServiceDisconnected: ");
            sb.append(strValueOf);
            Log.d(Constants.TAG, sb.toString());
        }
        flushQueue();
    }

    synchronized Task<Void> sendIntent(Intent intent) {
        BindRequest bindRequest;
        if (Log.isLoggable(Constants.TAG, 3)) {
            Log.d(Constants.TAG, "new intent queued in the bind-strategy delivery");
        }
        bindRequest = new BindRequest(intent);
        bindRequest.arrangeTimeout(this.scheduledExecutorService);
        this.intentQueue.add(bindRequest);
        flushQueue();
        return bindRequest.getTask();
    }

    WithinAppServiceConnection(Context context, String str, ScheduledExecutorService scheduledExecutorService) {
        this.intentQueue = new ArrayDeque();
        this.connectionInProgress = false;
        Context applicationContext = context.getApplicationContext();
        this.context = applicationContext;
        this.connectionIntent = new Intent("com.google.firebase.MESSAGING_EVENT").setPackage(applicationContext.getPackageName());
        this.scheduledExecutorService = scheduledExecutorService;
    }
}
