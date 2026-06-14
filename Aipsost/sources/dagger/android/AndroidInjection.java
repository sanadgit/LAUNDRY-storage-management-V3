package dagger.android;

import android.app.Activity;
import android.app.Application;
import android.app.Fragment;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.ComponentCallbacks2;
import android.content.ContentProvider;
import android.content.Context;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import dagger.internal.Preconditions;

/* JADX INFO: loaded from: classes11.dex */
public final class AndroidInjection {
    private static final String TAG = "dagger.android";

    public static void inject(Activity activity) {
        Preconditions.checkNotNull(activity, "activity");
        ComponentCallbacks2 application = activity.getApplication();
        if (!(application instanceof HasAndroidInjector)) {
            throw new RuntimeException(String.format("%s does not implement %s", application.getClass().getCanonicalName(), HasAndroidInjector.class.getCanonicalName()));
        }
        inject(activity, (HasAndroidInjector) application);
    }

    public static void inject(Fragment fragment) {
        Preconditions.checkNotNull(fragment, "fragment");
        HasAndroidInjector hasAndroidInjector = findHasAndroidInjectorForFragment(fragment);
        if (Log.isLoggable(TAG, 3)) {
            Log.d(TAG, String.format("An injector for %s was found in %s", fragment.getClass().getCanonicalName(), hasAndroidInjector.getClass().getCanonicalName()));
        }
        inject(fragment, hasAndroidInjector);
    }

    /* JADX WARN: Multi-variable type inference failed */
    private static HasAndroidInjector findHasAndroidInjectorForFragment(Fragment fragment) {
        Fragment fragment2 = fragment;
        do {
            Fragment parentFragment = fragment2.getParentFragment();
            fragment2 = parentFragment;
            if (parentFragment == null) {
                Activity activity = fragment.getActivity();
                if (activity instanceof HasAndroidInjector) {
                    return (HasAndroidInjector) activity;
                }
                if (activity.getApplication() instanceof HasAndroidInjector) {
                    return (HasAndroidInjector) activity.getApplication();
                }
                throw new IllegalArgumentException(String.format("No injector was found for %s", fragment.getClass().getCanonicalName()));
            }
        } while (!(fragment2 instanceof HasAndroidInjector));
        return (HasAndroidInjector) fragment2;
    }

    public static void inject(Service service) {
        Preconditions.checkNotNull(service, NotificationCompat.CATEGORY_SERVICE);
        ComponentCallbacks2 application = service.getApplication();
        if (!(application instanceof HasAndroidInjector)) {
            throw new RuntimeException(String.format("%s does not implement %s", application.getClass().getCanonicalName(), HasAndroidInjector.class.getCanonicalName()));
        }
        inject(service, (HasAndroidInjector) application);
    }

    public static void inject(BroadcastReceiver broadcastReceiver, Context context) {
        Preconditions.checkNotNull(broadcastReceiver, "broadcastReceiver");
        Preconditions.checkNotNull(context, "context");
        ComponentCallbacks2 componentCallbacks2 = (Application) context.getApplicationContext();
        if (!(componentCallbacks2 instanceof HasAndroidInjector)) {
            throw new RuntimeException(String.format("%s does not implement %s", componentCallbacks2.getClass().getCanonicalName(), HasAndroidInjector.class.getCanonicalName()));
        }
        inject(broadcastReceiver, (HasAndroidInjector) componentCallbacks2);
    }

    public static void inject(ContentProvider contentProvider) {
        Preconditions.checkNotNull(contentProvider, "contentProvider");
        ComponentCallbacks2 componentCallbacks2 = (Application) contentProvider.getContext().getApplicationContext();
        if (!(componentCallbacks2 instanceof HasAndroidInjector)) {
            throw new RuntimeException(String.format("%s does not implement %s", componentCallbacks2.getClass().getCanonicalName(), HasAndroidInjector.class.getCanonicalName()));
        }
        inject(contentProvider, (HasAndroidInjector) componentCallbacks2);
    }

    private static void inject(Object target, HasAndroidInjector hasAndroidInjector) {
        AndroidInjector<Object> androidInjector = hasAndroidInjector.androidInjector();
        Preconditions.checkNotNull(androidInjector, "%s.androidInjector() returned null", hasAndroidInjector.getClass());
        androidInjector.inject(target);
    }

    private AndroidInjection() {
    }
}
