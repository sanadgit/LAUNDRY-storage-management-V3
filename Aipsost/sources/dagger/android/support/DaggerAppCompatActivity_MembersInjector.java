package dagger.android.support;

import dagger.MembersInjector;
import dagger.android.DispatchingAndroidInjector;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DaggerAppCompatActivity_MembersInjector implements MembersInjector<DaggerAppCompatActivity> {
    private final Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider;

    public DaggerAppCompatActivity_MembersInjector(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        this.androidInjectorProvider = androidInjectorProvider;
    }

    public static MembersInjector<DaggerAppCompatActivity> create(Provider<DispatchingAndroidInjector<Object>> androidInjectorProvider) {
        return new DaggerAppCompatActivity_MembersInjector(androidInjectorProvider);
    }

    @Override // dagger.MembersInjector
    public void injectMembers(DaggerAppCompatActivity instance) {
        injectAndroidInjector(instance, this.androidInjectorProvider.get());
    }

    public static void injectAndroidInjector(DaggerAppCompatActivity instance, DispatchingAndroidInjector<Object> androidInjector) {
        instance.androidInjector = androidInjector;
    }
}
