package androidx.browser.trusted;

import android.app.Notification;
import android.content.ComponentName;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Parcelable;
import android.os.RemoteException;
import android.support.customtabs.trusted.ITrustedWebActivityCallback;
import android.support.customtabs.trusted.ITrustedWebActivityService;

/* JADX INFO: loaded from: classes.dex */
public final class TrustedWebActivityServiceConnection {
    private static final String KEY_ACTIVE_NOTIFICATIONS = "android.support.customtabs.trusted.ACTIVE_NOTIFICATIONS";
    private static final String KEY_CHANNEL_NAME = "android.support.customtabs.trusted.CHANNEL_NAME";
    private static final String KEY_NOTIFICATION = "android.support.customtabs.trusted.NOTIFICATION";
    private static final String KEY_NOTIFICATION_SUCCESS = "android.support.customtabs.trusted.NOTIFICATION_SUCCESS";
    private static final String KEY_PLATFORM_ID = "android.support.customtabs.trusted.PLATFORM_ID";
    private static final String KEY_PLATFORM_TAG = "android.support.customtabs.trusted.PLATFORM_TAG";
    private final ComponentName mComponentName;
    private final ITrustedWebActivityService mService;

    TrustedWebActivityServiceConnection(ITrustedWebActivityService service, ComponentName componentName) {
        this.mService = service;
        this.mComponentName = componentName;
    }

    public boolean areNotificationsEnabled(String channelName) throws RemoteException {
        Bundle args = new NotificationsEnabledArgs(channelName).toBundle();
        return ResultArgs.fromBundle(this.mService.areNotificationsEnabled(args)).success;
    }

    public boolean notify(String platformTag, int platformId, Notification notification, String channel) throws RemoteException {
        Bundle args = new NotifyNotificationArgs(platformTag, platformId, notification, channel).toBundle();
        return ResultArgs.fromBundle(this.mService.notifyNotificationWithChannel(args)).success;
    }

    public void cancel(String platformTag, int platformId) throws RemoteException {
        Bundle args = new CancelNotificationArgs(platformTag, platformId).toBundle();
        this.mService.cancelNotification(args);
    }

    public Parcelable[] getActiveNotifications() throws RemoteException {
        Bundle notifications = this.mService.getActiveNotifications();
        return ActiveNotificationsArgs.fromBundle(notifications).notifications;
    }

    public int getSmallIconId() throws RemoteException {
        return this.mService.getSmallIconId();
    }

    public Bitmap getSmallIconBitmap() throws RemoteException {
        return (Bitmap) this.mService.getSmallIconBitmap().getParcelable(TrustedWebActivityService.KEY_SMALL_ICON_BITMAP);
    }

    public ComponentName getComponentName() {
        return this.mComponentName;
    }

    public Bundle sendExtraCommand(String commandName, Bundle args, TrustedWebActivityCallback callback) throws RemoteException {
        ITrustedWebActivityCallback callbackBinder = wrapCallback(callback);
        IBinder binder = callbackBinder == null ? null : callbackBinder.asBinder();
        return this.mService.extraCommand(commandName, args, binder);
    }

    static class NotifyNotificationArgs {
        public final String channelName;
        public final Notification notification;
        public final int platformId;
        public final String platformTag;

        NotifyNotificationArgs(String platformTag, int platformId, Notification notification, String channelName) {
            this.platformTag = platformTag;
            this.platformId = platformId;
            this.notification = notification;
            this.channelName = channelName;
        }

        public static NotifyNotificationArgs fromBundle(Bundle bundle) {
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_PLATFORM_TAG);
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_PLATFORM_ID);
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_NOTIFICATION);
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_CHANNEL_NAME);
            return new NotifyNotificationArgs(bundle.getString(TrustedWebActivityServiceConnection.KEY_PLATFORM_TAG), bundle.getInt(TrustedWebActivityServiceConnection.KEY_PLATFORM_ID), (Notification) bundle.getParcelable(TrustedWebActivityServiceConnection.KEY_NOTIFICATION), bundle.getString(TrustedWebActivityServiceConnection.KEY_CHANNEL_NAME));
        }

        public Bundle toBundle() {
            Bundle args = new Bundle();
            args.putString(TrustedWebActivityServiceConnection.KEY_PLATFORM_TAG, this.platformTag);
            args.putInt(TrustedWebActivityServiceConnection.KEY_PLATFORM_ID, this.platformId);
            args.putParcelable(TrustedWebActivityServiceConnection.KEY_NOTIFICATION, this.notification);
            args.putString(TrustedWebActivityServiceConnection.KEY_CHANNEL_NAME, this.channelName);
            return args;
        }
    }

    static class CancelNotificationArgs {
        public final int platformId;
        public final String platformTag;

        CancelNotificationArgs(String platformTag, int platformId) {
            this.platformTag = platformTag;
            this.platformId = platformId;
        }

        public static CancelNotificationArgs fromBundle(Bundle bundle) {
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_PLATFORM_TAG);
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_PLATFORM_ID);
            return new CancelNotificationArgs(bundle.getString(TrustedWebActivityServiceConnection.KEY_PLATFORM_TAG), bundle.getInt(TrustedWebActivityServiceConnection.KEY_PLATFORM_ID));
        }

        public Bundle toBundle() {
            Bundle args = new Bundle();
            args.putString(TrustedWebActivityServiceConnection.KEY_PLATFORM_TAG, this.platformTag);
            args.putInt(TrustedWebActivityServiceConnection.KEY_PLATFORM_ID, this.platformId);
            return args;
        }
    }

    static class ResultArgs {
        public final boolean success;

        ResultArgs(boolean success) {
            this.success = success;
        }

        public static ResultArgs fromBundle(Bundle bundle) {
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_NOTIFICATION_SUCCESS);
            return new ResultArgs(bundle.getBoolean(TrustedWebActivityServiceConnection.KEY_NOTIFICATION_SUCCESS));
        }

        public Bundle toBundle() {
            Bundle args = new Bundle();
            args.putBoolean(TrustedWebActivityServiceConnection.KEY_NOTIFICATION_SUCCESS, this.success);
            return args;
        }
    }

    static class ActiveNotificationsArgs {
        public final Parcelable[] notifications;

        ActiveNotificationsArgs(Parcelable[] notifications) {
            this.notifications = notifications;
        }

        public static ActiveNotificationsArgs fromBundle(Bundle bundle) {
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_ACTIVE_NOTIFICATIONS);
            return new ActiveNotificationsArgs(bundle.getParcelableArray(TrustedWebActivityServiceConnection.KEY_ACTIVE_NOTIFICATIONS));
        }

        public Bundle toBundle() {
            Bundle args = new Bundle();
            args.putParcelableArray(TrustedWebActivityServiceConnection.KEY_ACTIVE_NOTIFICATIONS, this.notifications);
            return args;
        }
    }

    static class NotificationsEnabledArgs {
        public final String channelName;

        NotificationsEnabledArgs(String channelName) {
            this.channelName = channelName;
        }

        public static NotificationsEnabledArgs fromBundle(Bundle bundle) {
            TrustedWebActivityServiceConnection.ensureBundleContains(bundle, TrustedWebActivityServiceConnection.KEY_CHANNEL_NAME);
            return new NotificationsEnabledArgs(bundle.getString(TrustedWebActivityServiceConnection.KEY_CHANNEL_NAME));
        }

        public Bundle toBundle() {
            Bundle args = new Bundle();
            args.putString(TrustedWebActivityServiceConnection.KEY_CHANNEL_NAME, this.channelName);
            return args;
        }
    }

    static void ensureBundleContains(Bundle args, String key) {
        if (!args.containsKey(key)) {
            throw new IllegalArgumentException("Bundle must contain " + key);
        }
    }

    private static ITrustedWebActivityCallback wrapCallback(final TrustedWebActivityCallback callback) {
        if (callback == null) {
            return null;
        }
        return new ITrustedWebActivityCallback.Stub() { // from class: androidx.browser.trusted.TrustedWebActivityServiceConnection.1
            @Override // android.support.customtabs.trusted.ITrustedWebActivityCallback
            public void onExtraCallback(String callbackName, Bundle args) throws RemoteException {
                callback.onExtraCallback(callbackName, args);
            }
        };
    }
}
