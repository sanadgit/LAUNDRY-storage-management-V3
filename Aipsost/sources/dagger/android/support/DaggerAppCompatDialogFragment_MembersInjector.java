package dagger.android.support;

import dagger.MembersInjector;
import dagger.android.DispatchingAndroidInjector;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DaggerAppCompatDialogFragment_MembersInjector implements MembersInjector<DaggerAppCompatDialogFragment> {
    private final Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider;

    public DaggerAppCompatDialogFragment_MembersInjector(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        this.androidInjectorProvider = androidInjectorProvider;
    }

    public static MembersInjector<DaggerAppCompatDialogFragment> create(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        return new DaggerAppCompatDialogFragment_MembersInjector(androidInjectorProvider);
    }

    @Override // dagger.MembersInjector
    public void injectMembers(DaggerAppCompatDialogFragment instance) {
        injectAndroidInjector(instance, this.androidInjectorProvider.get());
    }

    public static void injectAndroidInjector(DaggerAppCompatDialogFragment instance, DispatchingAndroidInjector<Object> androidInjector) {
        instance.androidInjector = androidInjector;
    }
}
