package com.google.firebase.messaging;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import java.io.IOException;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
class TopicsSyncTask implements Runnable {
    private final Context context;
    private final Metadata metadata;
    private final long nextDelaySeconds;
    private final PowerManager.WakeLock syncWakeLock;
    private final TopicsSubscriber topicsSubscriber;
    private static final Object TOPIC_SYNC_TASK_LOCK = new Object();
    private static Boolean hasWakeLockPermission = null;
    private static Boolean hasAccessNetworkStatePermission = null;

    /* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
    class ConnectivityChangeReceiver extends BroadcastReceiver {
        private TopicsSyncTask task;

        public ConnectivityChangeReceiver(TopicsSyncTask topicsSyncTask) {
            this.task = topicsSyncTask;
        }

        @Override // android.content.BroadcastReceiver
        public synchronized void onReceive(Context context, Intent intent) {
            TopicsSyncTask topicsSyncTask = this.task;
            if (topicsSyncTask == null) {
                return;
            }
            if (topicsSyncTask.isDeviceConnected()) {
                if (TopicsSyncTask.isLoggable()) {
                    Log.d(Constants.TAG, "Connectivity changed. Starting background sync.");
                }
                this.task.topicsSubscriber.scheduleSyncTaskWithDelaySeconds(this.task, 0L);
                context.unregisterReceiver(this);
                this.task = null;
            }
        }

        public void registerReceiver() {
            if (TopicsSyncTask.isLoggable()) {
                Log.d(Constants.TAG, "Connectivity change received registered");
            }
            TopicsSyncTask.this.context.registerReceiver(this, new IntentFilter("android.net.conn.CONNECTIVITY_CHANGE"));
        }
    }

    TopicsSyncTask(TopicsSubscriber topicsSubscriber, Context context, Metadata metadata, long j) {
        this.topicsSubscriber = topicsSubscriber;
        this.context = context;
        this.nextDelaySeconds = j;
        this.metadata = metadata;
        this.syncWakeLock = ((PowerManager) context.getSystemService("power")).newWakeLock(1, Constants.FCM_WAKE_LOCK);
    }

    private static String createPermissionMissingLog(String str) {
        StringBuilder sb = new StringBuilder(str.length() + 142);
        sb.append("Missing Permission: ");
        sb.append(str);
        sb.append(". This permission should normally be included by the manifest merger, but may needed to be manually added to your manifest");
        return sb.toString();
    }

    private static boolean hasAccessNetworkStatePermission(Context context) {
        boolean zBooleanValue;
        synchronized (TOPIC_SYNC_TASK_LOCK) {
            Boolean bool = hasAccessNetworkStatePermission;
            Boolean boolValueOf = Boolean.valueOf(bool == null ? hasPermission(context, "android.permission.ACCESS_NETWORK_STATE", bool) : bool.booleanValue());
            hasAccessNetworkStatePermission = boolValueOf;
            zBooleanValue = boolValueOf.booleanValue();
        }
        return zBooleanValue;
    }

    private static boolean hasPermission(Context context, String str, Boolean bool) {
        if (bool != null) {
            return bool.booleanValue();
        }
        boolean z = context.checkCallingOrSelfPermission(str) == 0;
        if (z || !Log.isLoggable(Constants.TAG, 3)) {
            return z;
        }
        Log.d(Constants.TAG, createPermissionMissingLog(str));
        return false;
    }

    private static boolean hasWakeLockPermission(Context context) {
        boolean zBooleanValue;
        synchronized (TOPIC_SYNC_TASK_LOCK) {
            Boolean bool = hasWakeLockPermission;
            Boolean boolValueOf = Boolean.valueOf(bool == null ? hasPermission(context, "android.permission.WAKE_LOCK", bool) : bool.booleanValue());
            hasWakeLockPermission = boolValueOf;
            zBooleanValue = boolValueOf.booleanValue();
        }
        return zBooleanValue;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public synchronized boolean isDeviceConnected() {
        ConnectivityManager connectivityManager = (ConnectivityManager) this.context.getSystemService("connectivity");
        NetworkInfo activeNetworkInfo = connectivityManager != null ? connectivityManager.getActiveNetworkInfo() : null;
        if (activeNetworkInfo != null) {
            if (activeNetworkInfo.isConnected()) {
                return true;
            }
        }
        return false;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static boolean isLoggable() {
        if (Log.isLoggable(Constants.TAG, 3)) {
            return true;
        }
        return Build.VERSION.SDK_INT == 23 && Log.isLoggable(Constants.TAG, 3);
    }

    @Override // java.lang.Runnable
    public void run() {
        if (hasWakeLockPermission(this.context)) {
            this.syncWakeLock.acquire(Constants.WAKE_LOCK_ACQUIRE_TIMEOUT_MILLIS);
        }
        try {
            try {
                this.topicsSubscriber.setSyncScheduledOrRunning(true);
                if (this.metadata.isGmscorePresent()) {
                    try {
                        if (hasAccessNetworkStatePermission(this.context) && !isDeviceConnected()) {
                            new ConnectivityChangeReceiver(this).registerReceiver();
                            if (hasWakeLockPermission(this.context)) {
                                this.syncWakeLock.release();
                                return;
                            }
                            return;
                        }
                        if (this.topicsSubscriber.syncTopics()) {
                            this.topicsSubscriber.setSyncScheduledOrRunning(false);
                        } else {
                            this.topicsSubscriber.syncWithDelaySecondsInternal(this.nextDelaySeconds);
                        }
                        if (hasWakeLockPermission(this.context)) {
                            this.syncWakeLock.release();
                        }
                    } catch (RuntimeException e) {
                    }
                } else {
                    this.topicsSubscriber.setSyncScheduledOrRunning(false);
                }
            } catch (IOException e2) {
                String strValueOf = String.valueOf(e2.getMessage());
                Log.e(Constants.TAG, strValueOf.length() != 0 ? "Failed to sync topics. Won't retry sync. ".concat(strValueOf) : new String("Failed to sync topics. Won't retry sync. "));
                this.topicsSubscriber.setSyncScheduledOrRunning(false);
                if (!hasWakeLockPermission(this.context)) {
                    return;
                }
                try {
                    this.syncWakeLock.release();
                } catch (RuntimeException e3) {
                }
            }
        } finally {
            if (hasWakeLockPermission(this.context)) {
                try {
                    this.syncWakeLock.release();
                } catch (RuntimeException e4) {
                    Log.i(Constants.TAG, "TopicsSyncTask's wakelock was already released due to timeout.");
                }
            }
        }
    }
}
