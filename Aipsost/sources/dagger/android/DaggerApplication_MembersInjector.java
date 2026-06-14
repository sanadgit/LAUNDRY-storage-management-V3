package dagger.android;

import dagger.MembersInjector;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DaggerApplication_MembersInjector implements MembersInjector<DaggerApplication> {
    private final Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider;

    public DaggerApplication_MembersInjector(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        this.androidInjectorProvider = androidInjectorProvider;
    }

    public static MembersInjector<DaggerApplication> create(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        return new DaggerApplication_MembersInjector(androidInjectorProvider);
    }

    @Override // dagger.MembersInjector
    public void injectMembers(DaggerApplication instance) {
        injectAndroidInjector(instance, this.androidInjectorProvider.get());
    }

    public static void injectAndroidInjector(DaggerApplication instance, DispatchingAndroidInjector<Object> androidInjector) {
        instance.androidInjector = androidInjector;
    }
}
