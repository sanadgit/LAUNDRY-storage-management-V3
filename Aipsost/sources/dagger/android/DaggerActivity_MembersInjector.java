package dagger.android;

import dagger.MembersInjector;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DaggerActivity_MembersInjector implements MembersInjector<DaggerActivity> {
    private final Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider;

    public DaggerActivity_MembersInjector(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        this.androidInjectorProvider = androidInjectorProvider;
    }

    public static MembersInjector<DaggerActivity> create(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        return new DaggerActivity_MembersInjector(androidInjectorProvider);
    }

    @Override // dagger.MembersInjector
    public void injectMembers(DaggerActivity instance) {
        injectAndroidInjector(instance, this.androidInjectorProvider.get());
    }

    public static void injectAndroidInjector(DaggerActivity instance, DispatchingAndroidInjector<Object> androidInjector) {
        instance.androidInjector = androidInjector;
    }
}
