package com.google.firebase.messaging;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.content.pm.ServiceInfo;
import android.util.Log;
import java.util.ArrayDeque;
import java.util.Queue;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
public class ServiceStarter {
    public static final int ERROR_UNKNOWN = 500;
    public static final int SUCCESS = -1;
    private static ServiceStarter instance;
    private String firebaseMessagingServiceClassName = null;
    private Boolean hasWakeLockPermission = null;
    private Boolean hasAccessNetworkStatePermission = null;
    private final Queue<Intent> messagingEvents = new ArrayDeque();

    private ServiceStarter() {
    }

    private int doStartService(Context context, Intent intent) {
        ComponentName componentNameStartService;
        String strResolveServiceClassName = resolveServiceClassName(context, intent);
        if (strResolveServiceClassName != null) {
            if (Log.isLoggable(Constants.TAG, 3)) {
                Log.d(Constants.TAG, strResolveServiceClassName.length() != 0 ? "Restricting intent to a specific service: ".concat(strResolveServiceClassName) : new String("Restricting intent to a specific service: "));
            }
            intent.setClassName(context.getPackageName(), strResolveServiceClassName);
        }
        try {
            if (hasWakeLockPermission(context)) {
                componentNameStartService = WakeLockHolder.startWakefulService(context, intent);
            } else {
                componentNameStartService = context.startService(intent);
                Log.d(Constants.TAG, "Missing wake lock permission, service start may be delayed");
            }
            if (componentNameStartService != null) {
                return -1;
            }
            Log.e(Constants.TAG, "Error while delivering the message: ServiceIntent not found.");
            return 404;
        } catch (IllegalStateException e) {
            String strValueOf = String.valueOf(e);
            StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 45);
            sb.append("Failed to start service while in background: ");
            sb.append(strValueOf);
            Log.e(Constants.TAG, sb.toString());
            return 402;
        } catch (SecurityException e2) {
            Log.e(Constants.TAG, "Error while delivering the message to the serviceIntent", e2);
            return 401;
        }
    }

    static synchronized ServiceStarter getInstance() {
        if (instance == null) {
            instance = new ServiceStarter();
        }
        return instance;
    }

    private synchronized String resolveServiceClassName(Context context, Intent intent) {
        String str = this.firebaseMessagingServiceClassName;
        if (str != null) {
            return str;
        }
        ResolveInfo resolveInfoResolveService = context.getPackageManager().resolveService(intent, 0);
        if (resolveInfoResolveService != null && resolveInfoResolveService.serviceInfo != null) {
            ServiceInfo serviceInfo = resolveInfoResolveService.serviceInfo;
            if (context.getPackageName().equals(serviceInfo.packageName) && serviceInfo.name != null) {
                if (serviceInfo.name.startsWith(".")) {
                    String strValueOf = String.valueOf(context.getPackageName());
                    String strValueOf2 = String.valueOf(serviceInfo.name);
                    this.firebaseMessagingServiceClassName = strValueOf2.length() != 0 ? strValueOf.concat(strValueOf2) : new String(strValueOf);
                } else {
                    this.firebaseMessagingServiceClassName = serviceInfo.name;
                }
                return this.firebaseMessagingServiceClassName;
            }
            String str2 = serviceInfo.packageName;
            String str3 = serviceInfo.name;
            StringBuilder sb = new StringBuilder(String.valueOf(str2).length() + 94 + String.valueOf(str3).length());
            sb.append("Error resolving target intent service, skipping classname enforcement. Resolved service was: ");
            sb.append(str2);
            sb.append("/");
            sb.append(str3);
            Log.e(Constants.TAG, sb.toString());
            return null;
        }
        Log.e(Constants.TAG, "Failed to resolve target intent service, skipping classname enforcement");
        return null;
    }

    public static void setForTesting(ServiceStarter serviceStarter) {
        instance = serviceStarter;
    }

    Intent getMessagingEvent() {
        return this.messagingEvents.poll();
    }

    boolean hasAccessNetworkStatePermission(Context context) {
        if (this.hasAccessNetworkStatePermission == null) {
            this.hasAccessNetworkStatePermission = Boolean.valueOf(context.checkCallingOrSelfPermission("android.permission.ACCESS_NETWORK_STATE") == 0);
        }
        if (!this.hasWakeLockPermission.booleanValue() && Log.isLoggable(Constants.TAG, 3)) {
            Log.d(Constants.TAG, "Missing Permission: android.permission.ACCESS_NETWORK_STATE this should normally be included by the manifest merger, but may needed to be manually added to your manifest");
        }
        return this.hasAccessNetworkStatePermission.booleanValue();
    }

    boolean hasWakeLockPermission(Context context) {
        if (this.hasWakeLockPermission == null) {
            this.hasWakeLockPermission = Boolean.valueOf(context.checkCallingOrSelfPermission("android.permission.WAKE_LOCK") == 0);
        }
        if (!this.hasWakeLockPermission.booleanValue() && Log.isLoggable(Constants.TAG, 3)) {
            Log.d(Constants.TAG, "Missing Permission: android.permission.WAKE_LOCK this should normally be included by the manifest merger, but may needed to be manually added to your manifest");
        }
        return this.hasWakeLockPermission.booleanValue();
    }

    public int startMessagingService(Context context, Intent intent) {
        if (Log.isLoggable(Constants.TAG, 3)) {
            Log.d(Constants.TAG, "Starting service");
        }
        this.messagingEvents.offer(intent);
        Intent intent2 = new Intent("com.google.firebase.MESSAGING_EVENT");
        intent2.setPackage(context.getPackageName());
        return doStartService(context, intent2);
    }
}
