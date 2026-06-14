package dagger.android.support;

import android.util.Log;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import dagger.android.AndroidInjector;
import dagger.android.HasAndroidInjector;
import dagger.internal.Preconditions;

/* JADX INFO: loaded from: classes11.dex */
public final class AndroidSupportInjection {
    private static final String TAG = "dagger.android.support";

    public static void inject(Fragment fragment) {
        Preconditions.checkNotNull(fragment, "fragment");
        HasAndroidInjector hasAndroidInjector = findHasAndroidInjectorForFragment(fragment);
        if (Log.isLoggable(TAG, 3)) {
            Log.d(TAG, String.format("An injector for %s was found in %s", fragment.getClass().getCanonicalName(), hasAndroidInjector.getClass().getCanonicalName()));
        }
        inject(fragment, hasAndroidInjector);
    }

    private static void inject(Object target, HasAndroidInjector hasAndroidInjector) {
        AndroidInjector<Object> androidInjector = hasAndroidInjector.androidInjector();
        Preconditions.checkNotNull(androidInjector, "%s.androidInjector() returned null", hasAndroidInjector.getClass());
        androidInjector.inject(target);
    }

    /* JADX WARN: Multi-variable type inference failed */
    private static HasAndroidInjector findHasAndroidInjectorForFragment(Fragment fragment) {
        Fragment fragment2 = fragment;
        do {
            Fragment parentFragment = fragment2.getParentFragment();
            fragment2 = parentFragment;
            if (parentFragment == null) {
                FragmentActivity activity = fragment.getActivity();
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

    private AndroidSupportInjection() {
    }
}
