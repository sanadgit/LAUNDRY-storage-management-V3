package androidx.browser.customtabs;

import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.RemoteException;
import android.support.customtabs.ICustomTabsCallback;
import android.support.customtabs.ICustomTabsService;
import android.text.TextUtils;
import android.util.Log;
import androidx.browser.customtabs.CustomTabsSession;
import androidx.core.view.accessibility.AccessibilityEventCompat;
import java.util.ArrayList;
import java.util.List;

/* JADX INFO: loaded from: classes.dex */
public class CustomTabsClient {
    private static final String TAG = "CustomTabsClient";
    private final Context mApplicationContext;
    private final ICustomTabsService mService;
    private final ComponentName mServiceComponentName;

    CustomTabsClient(ICustomTabsService service, ComponentName componentName, Context applicationContext) {
        this.mService = service;
        this.mServiceComponentName = componentName;
        this.mApplicationContext = applicationContext;
    }

    public static boolean bindCustomTabsService(Context context, String packageName, CustomTabsServiceConnection connection) {
        connection.setApplicationContext(context.getApplicationContext());
        Intent intent = new Intent(CustomTabsService.ACTION_CUSTOM_TABS_CONNECTION);
        if (!TextUtils.isEmpty(packageName)) {
            intent.setPackage(packageName);
        }
        return context.bindService(intent, connection, 33);
    }

    public static boolean bindCustomTabsServicePreservePriority(Context context, String packageName, CustomTabsServiceConnection connection) {
        connection.setApplicationContext(context.getApplicationContext());
        Intent intent = new Intent(CustomTabsService.ACTION_CUSTOM_TABS_CONNECTION);
        if (!TextUtils.isEmpty(packageName)) {
            intent.setPackage(packageName);
        }
        return context.bindService(intent, connection, 1);
    }

    public static String getPackageName(Context context, List<String> packages) {
        return getPackageName(context, packages, false);
    }

    public static String getPackageName(Context context, List<String> packages, boolean ignoreDefault) {
        ResolveInfo defaultViewHandlerInfo;
        PackageManager pm = context.getPackageManager();
        List<String> packageNames = packages == null ? new ArrayList<>() : packages;
        Intent activityIntent = new Intent("android.intent.action.VIEW", Uri.parse("http://"));
        if (!ignoreDefault && (defaultViewHandlerInfo = pm.resolveActivity(activityIntent, 0)) != null) {
            String packageName = defaultViewHandlerInfo.activityInfo.packageName;
            packageNames = new ArrayList(packageNames.size() + 1);
            packageNames.add(packageName);
            if (packages != null) {
                packageNames.addAll(packages);
            }
        }
        Intent serviceIntent = new Intent(CustomTabsService.ACTION_CUSTOM_TABS_CONNECTION);
        for (String packageName2 : packageNames) {
            serviceIntent.setPackage(packageName2);
            if (pm.resolveService(serviceIntent, 0) != null) {
                return packageName2;
            }
        }
        if (Build.VERSION.SDK_INT >= 30) {
            Log.w(TAG, "Unable to find any Custom Tabs packages, you may need to add a <queries> element to your manifest. See the docs for CustomTabsClient#getPackageName.");
            return null;
        }
        return null;
    }

    public static boolean connectAndInitialize(Context context, String packageName) {
        if (packageName == null) {
            return false;
        }
        final Context applicationContext = context.getApplicationContext();
        CustomTabsServiceConnection connection = new CustomTabsServiceConnection() { // from class: androidx.browser.customtabs.CustomTabsClient.1
            @Override // androidx.browser.customtabs.CustomTabsServiceConnection
            public final void onCustomTabsServiceConnected(ComponentName name, CustomTabsClient client) {
                client.warmup(0L);
                applicationContext.unbindService(this);
            }

            @Override // android.content.ServiceConnection
            public void onServiceDisconnected(ComponentName componentName) {
            }
        };
        try {
            return bindCustomTabsService(applicationContext, packageName, connection);
        } catch (SecurityException e) {
            return false;
        }
    }

    public boolean warmup(long flags) {
        try {
            return this.mService.warmup(flags);
        } catch (RemoteException e) {
            return false;
        }
    }

    private static PendingIntent createSessionId(Context context, int sessionId) {
        return PendingIntent.getActivity(context, sessionId, new Intent(), AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL);
    }

    public CustomTabsSession newSession(CustomTabsCallback callback) {
        return newSessionInternal(callback, null);
    }

    public CustomTabsSession newSession(CustomTabsCallback callback, int id) {
        return newSessionInternal(callback, createSessionId(this.mApplicationContext, id));
    }

    public static CustomTabsSession.PendingSession newPendingSession(Context context, CustomTabsCallback callback, int id) {
        PendingIntent sessionId = createSessionId(context, id);
        return new CustomTabsSession.PendingSession(callback, sessionId);
    }

    private CustomTabsSession newSessionInternal(CustomTabsCallback callback, PendingIntent sessionId) {
        boolean success;
        ICustomTabsCallback.Stub wrapper = createCallbackWrapper(callback);
        try {
            if (sessionId != null) {
                Bundle extras = new Bundle();
                extras.putParcelable(CustomTabsIntent.EXTRA_SESSION_ID, sessionId);
                success = this.mService.newSessionWithExtras(wrapper, extras);
            } else {
                success = this.mService.newSession(wrapper);
            }
            if (!success) {
                return null;
            }
            return new CustomTabsSession(this.mService, wrapper, this.mServiceComponentName, sessionId);
        } catch (RemoteException e) {
            return null;
        }
    }

    public Bundle extraCommand(String commandName, Bundle args) {
        try {
            return this.mService.extraCommand(commandName, args);
        } catch (RemoteException e) {
            return null;
        }
    }

    private ICustomTabsCallback.Stub createCallbackWrapper(final CustomTabsCallback callback) {
        return new ICustomTabsCallback.Stub() { // from class: androidx.browser.customtabs.CustomTabsClient.2
            private Handler mHandler = new Handler(Looper.getMainLooper());

            @Override // android.support.customtabs.ICustomTabsCallback
            public void onNavigationEvent(final int navigationEvent, final Bundle extras) {
                if (callback == null) {
                    return;
                }
                this.mHandler.post(new Runnable() { // from class: androidx.browser.customtabs.CustomTabsClient.2.1
                    @Override // java.lang.Runnable
                    public void run() {
                        callback.onNavigationEvent(navigationEvent, extras);
                    }
                });
            }

            @Override // android.support.customtabs.ICustomTabsCallback
            public void extraCallback(final String callbackName, final Bundle args) throws RemoteException {
                if (callback == null) {
                    return;
                }
                this.mHandler.post(new Runnable() { // from class: androidx.browser.customtabs.CustomTabsClient.2.2
                    @Override // java.lang.Runnable
                    public void run() {
                        callback.extraCallback(callbackName, args);
                    }
                });
            }

            @Override // android.support.customtabs.ICustomTabsCallback
            public Bundle extraCallbackWithResult(String callbackName, Bundle args) throws RemoteException {
                CustomTabsCallback customTabsCallback = callback;
                if (customTabsCallback == null) {
                    return null;
                }
                return customTabsCallback.extraCallbackWithResult(callbackName, args);
            }

            @Override // android.support.customtabs.ICustomTabsCallback
            public void onMessageChannelReady(final Bundle extras) throws RemoteException {
                if (callback == null) {
                    return;
                }
                this.mHandler.post(new Runnable() { // from class: androidx.browser.customtabs.CustomTabsClient.2.3
                    @Override // java.lang.Runnable
                    public void run() {
                        callback.onMessageChannelReady(extras);
                    }
                });
            }

            @Override // android.support.customtabs.ICustomTabsCallback
            public void onPostMessage(final String message, final Bundle extras) throws RemoteException {
                if (callback == null) {
                    return;
                }
                this.mHandler.post(new Runnable() { // from class: androidx.browser.customtabs.CustomTabsClient.2.4
                    @Override // java.lang.Runnable
                    public void run() {
                        callback.onPostMessage(message, extras);
                    }
                });
            }

            @Override // android.support.customtabs.ICustomTabsCallback
            public void onRelationshipValidationResult(final int relation, final Uri requestedOrigin, final boolean result, final Bundle extras) throws RemoteException {
                if (callback == null) {
                    return;
                }
                this.mHandler.post(new Runnable() { // from class: androidx.browser.customtabs.CustomTabsClient.2.5
                    @Override // java.lang.Runnable
                    public void run() {
                        callback.onRelationshipValidationResult(relation, requestedOrigin, result, extras);
                    }
                });
            }
        };
    }

    public CustomTabsSession attachSession(CustomTabsSession.PendingSession session) {
        return newSessionInternal(session.getCallback(), session.getId());
    }
}
