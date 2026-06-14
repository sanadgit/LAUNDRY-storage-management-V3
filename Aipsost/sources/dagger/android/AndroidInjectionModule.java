package dagger.android;

import dagger.Module;
import dagger.android.AndroidInjector;
import dagger.multibindings.Multibinds;
import java.util.Map;

/* JADX INFO: loaded from: classes11.dex */
@Module
public abstract class AndroidInjectionModule {
    @Multibinds
    abstract Map<Class<?>, AndroidInjector.Factory<?>> classKeyedInjectorFactories();

    @Multibinds
    abstract Map<String, AndroidInjector.Factory<?>> stringKeyedInjectorFactories();

    private AndroidInjectionModule() {
    }
}
