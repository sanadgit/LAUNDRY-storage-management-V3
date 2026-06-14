package dagger.android;

import dagger.android.AndroidInjector;
import dagger.internal.Factory;
import java.util.Map;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DispatchingAndroidInjector_Factory<T> implements Factory<DispatchingAndroidInjector<T>> {
    private final Provider<Map<Class<?>, Provider<AndroidInjector.Factory<?>>>> injectorFactoriesWithClassKeysProvider;
    private final Provider<Map<String, Provider<AndroidInjector.Factory<?>>>> injectorFactoriesWithStringKeysProvider;

    public DispatchingAndroidInjector_Factory(Provider<Map<Class<?>, Provider<AndroidInjector.Factory<?>>>> injectorFactoriesWithClassKeysProvider, Provider<Map<String, Provider<AndroidInjector.Factory<?>>>> injectorFactoriesWithStringKeysProvider) {
        this.injectorFactoriesWithClassKeysProvider = injectorFactoriesWithClassKeysProvider;
        this.injectorFactoriesWithStringKeysProvider = injectorFactoriesWithStringKeysProvider;
    }

    @Override // javax.inject.Provider
    public DispatchingAndroidInjector<T> get() {
        return newInstance(this.injectorFactoriesWithClassKeysProvider.get(), this.injectorFactoriesWithStringKeysProvider.get());
    }

    public static <T> DispatchingAndroidInjector_Factory<T> create(Provider<Map<Class<?>, Provider<AndroidInjector.Factory<?>>>> injectorFactoriesWithClassKeysProvider, Provider<Map<String, Provider<AndroidInjector.Factory<?>>>> injectorFactoriesWithStringKeysProvider) {
        return new DispatchingAndroidInjector_Factory<>(injectorFactoriesWithClassKeysProvider, injectorFactoriesWithStringKeysProvider);
    }

    public static <T> DispatchingAndroidInjector<T> newInstance(Map<Class<?>, Provider<AndroidInjector.Factory<?>>> injectorFactoriesWithClassKeys, Map<String, Provider<AndroidInjector.Factory<?>>> injectorFactoriesWithStringKeys) {
        return new DispatchingAndroidInjector<>(injectorFactoriesWithClassKeys, injectorFactoriesWithStringKeys);
    }
}
