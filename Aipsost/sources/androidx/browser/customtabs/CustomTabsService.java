package androidx.browser.customtabs;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.support.customtabs.ICustomTabsCallback;
import android.support.customtabs.ICustomTabsService;
import androidx.collection.SimpleArrayMap;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.util.List;
import java.util.NoSuchElementException;

/* JADX INFO: loaded from: classes.dex */
public abstract class CustomTabsService extends Service {
    public static final String ACTION_CUSTOM_TABS_CONNECTION = "android.support.customtabs.action.CustomTabsService";
    public static final String CATEGORY_COLOR_SCHEME_CUSTOMIZATION = "androidx.browser.customtabs.category.ColorSchemeCustomization";
    public static final String CATEGORY_NAVBAR_COLOR_CUSTOMIZATION = "androidx.browser.customtabs.category.NavBarColorCustomization";
    public static final String CATEGORY_TRUSTED_WEB_ACTIVITY_IMMERSIVE_MODE = "androidx.browser.trusted.category.ImmersiveMode";
    public static final String CATEGORY_WEB_SHARE_TARGET_V2 = "androidx.browser.trusted.category.WebShareTargetV2";
    public static final int FILE_PURPOSE_TRUSTED_WEB_ACTIVITY_SPLASH_IMAGE = 1;
    public static final String KEY_SUCCESS = "androidx.browser.customtabs.SUCCESS";
    public static final String KEY_URL = "android.support.customtabs.otherurls.URL";
    public static final int RELATION_HANDLE_ALL_URLS = 2;
    public static final int RELATION_USE_AS_ORIGIN = 1;
    public static final int RESULT_FAILURE_DISALLOWED = -1;
    public static final int RESULT_FAILURE_MESSAGING_ERROR = -3;
    public static final int RESULT_FAILURE_REMOTE_ERROR = -2;
    public static final int RESULT_SUCCESS = 0;
    public static final String TRUSTED_WEB_ACTIVITY_CATEGORY = "androidx.browser.trusted.category.TrustedWebActivities";
    final SimpleArrayMap<IBinder, IBinder.DeathRecipient> mDeathRecipientMap = new SimpleArrayMap<>();
    private ICustomTabsService.Stub mBinder = new AnonymousClass1();

    @Retention(RetentionPolicy.SOURCE)
    public @interface FilePurpose {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface Relation {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface Result {
    }

    protected abstract Bundle extraCommand(String str, Bundle bundle);

    protected abstract boolean mayLaunchUrl(CustomTabsSessionToken customTabsSessionToken, Uri uri, Bundle bundle, List<Bundle> list);

    protected abstract boolean newSession(CustomTabsSessionToken customTabsSessionToken);

    protected abstract int postMessage(CustomTabsSessionToken customTabsSessionToken, String str, Bundle bundle);

    protected abstract boolean receiveFile(CustomTabsSessionToken customTabsSessionToken, Uri uri, int i, Bundle bundle);

    protected abstract boolean requestPostMessageChannel(CustomTabsSessionToken customTabsSessionToken, Uri uri);

    protected abstract boolean updateVisuals(CustomTabsSessionToken customTabsSessionToken, Bundle bundle);

    protected abstract boolean validateRelationship(CustomTabsSessionToken customTabsSessionToken, int i, Uri uri, Bundle bundle);

    protected abstract boolean warmup(long j);

    /* JADX INFO: renamed from: androidx.browser.customtabs.CustomTabsService$1, reason: invalid class name */
    class AnonymousClass1 extends ICustomTabsService.Stub {
        AnonymousClass1() {
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean warmup(long flags) {
            return CustomTabsService.this.warmup(flags);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean newSession(ICustomTabsCallback callback) {
            return newSessionInternal(callback, null);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean newSessionWithExtras(ICustomTabsCallback callback, Bundle extras) {
            return newSessionInternal(callback, getSessionIdFromBundle(extras));
        }

        private boolean newSessionInternal(ICustomTabsCallback callback, PendingIntent sessionId) {
            final CustomTabsSessionToken sessionToken = new CustomTabsSessionToken(callback, sessionId);
            try {
                IBinder.DeathRecipient deathRecipient = new IBinder.DeathRecipient() { // from class: androidx.browser.customtabs.CustomTabsService$1$$ExternalSyntheticLambda0
                    @Override // android.os.IBinder.DeathRecipient
                    public final void binderDied() {
                        this.f$0.m3x67c68af6(sessionToken);
                    }
                };
                synchronized (CustomTabsService.this.mDeathRecipientMap) {
                    callback.asBinder().linkToDeath(deathRecipient, 0);
                    CustomTabsService.this.mDeathRecipientMap.put(callback.asBinder(), deathRecipient);
                }
                return CustomTabsService.this.newSession(sessionToken);
            } catch (RemoteException e) {
                return false;
            }
        }

        /* JADX INFO: renamed from: lambda$newSessionInternal$0$androidx-browser-customtabs-CustomTabsService$1, reason: not valid java name */
        /* synthetic */ void m3x67c68af6(CustomTabsSessionToken sessionToken) {
            CustomTabsService.this.cleanUpSession(sessionToken);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean mayLaunchUrl(ICustomTabsCallback callback, Uri url, Bundle extras, List<Bundle> otherLikelyBundles) {
            return CustomTabsService.this.mayLaunchUrl(new CustomTabsSessionToken(callback, getSessionIdFromBundle(extras)), url, extras, otherLikelyBundles);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public Bundle extraCommand(String commandName, Bundle args) {
            return CustomTabsService.this.extraCommand(commandName, args);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean updateVisuals(ICustomTabsCallback callback, Bundle bundle) {
            return CustomTabsService.this.updateVisuals(new CustomTabsSessionToken(callback, getSessionIdFromBundle(bundle)), bundle);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean requestPostMessageChannel(ICustomTabsCallback callback, Uri postMessageOrigin) {
            return CustomTabsService.this.requestPostMessageChannel(new CustomTabsSessionToken(callback, null), postMessageOrigin);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean requestPostMessageChannelWithExtras(ICustomTabsCallback callback, Uri postMessageOrigin, Bundle extras) {
            return CustomTabsService.this.requestPostMessageChannel(new CustomTabsSessionToken(callback, getSessionIdFromBundle(extras)), postMessageOrigin);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public int postMessage(ICustomTabsCallback callback, String message, Bundle extras) {
            return CustomTabsService.this.postMessage(new CustomTabsSessionToken(callback, getSessionIdFromBundle(extras)), message, extras);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean validateRelationship(ICustomTabsCallback callback, int relation, Uri origin, Bundle extras) {
            return CustomTabsService.this.validateRelationship(new CustomTabsSessionToken(callback, getSessionIdFromBundle(extras)), relation, origin, extras);
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean receiveFile(ICustomTabsCallback callback, Uri uri, int purpose, Bundle extras) {
            return CustomTabsService.this.receiveFile(new CustomTabsSessionToken(callback, getSessionIdFromBundle(extras)), uri, purpose, extras);
        }

        private PendingIntent getSessionIdFromBundle(Bundle bundle) {
            if (bundle == null) {
                return null;
            }
            PendingIntent sessionId = (PendingIntent) bundle.getParcelable(CustomTabsIntent.EXTRA_SESSION_ID);
            bundle.remove(CustomTabsIntent.EXTRA_SESSION_ID);
            return sessionId;
        }
    }

    @Override // android.app.Service
    public IBinder onBind(Intent intent) {
        return this.mBinder;
    }

    protected boolean cleanUpSession(CustomTabsSessionToken sessionToken) {
        try {
            synchronized (this.mDeathRecipientMap) {
                IBinder binder = sessionToken.getCallbackBinder();
                if (binder == null) {
                    return false;
                }
                IBinder.DeathRecipient deathRecipient = this.mDeathRecipientMap.get(binder);
                binder.unlinkToDeath(deathRecipient, 0);
                this.mDeathRecipientMap.remove(binder);
                return true;
            }
        } catch (NoSuchElementException e) {
            return false;
        }
    }
}
