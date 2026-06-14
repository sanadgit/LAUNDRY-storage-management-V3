package dagger.android;

import dagger.MembersInjector;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DaggerDialogFragment_MembersInjector implements MembersInjector<DaggerDialogFragment> {
    private final Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider;

    public DaggerDialogFragment_MembersInjector(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        this.androidInjectorProvider = androidInjectorProvider;
    }

    public static MembersInjector<DaggerDialogFragment> create(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        return new DaggerDialogFragment_MembersInjector(androidInjectorProvider);
    }

    @Override // dagger.MembersInjector
    public void injectMembers(DaggerDialogFragment instance) {
        injectAndroidInjector(instance, this.androidInjectorProvider.get());
    }

    public static void injectAndroidInjector(DaggerDialogFragment instance, DispatchingAndroidInjector<Object> androidInjector) {
        instance.androidInjector = androidInjector;
    }
}
