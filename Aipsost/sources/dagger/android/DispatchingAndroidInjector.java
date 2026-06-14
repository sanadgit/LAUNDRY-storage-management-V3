package dagger.android;

import dagger.android.AndroidInjector;
import dagger.internal.DaggerCollections;
import dagger.internal.Preconditions;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DispatchingAndroidInjector<T> implements AndroidInjector<T> {
    private static final String NO_SUPERTYPES_BOUND_FORMAT = "No injector factory bound for Class<%s>";
    private static final String SUPERTYPES_BOUND_FORMAT = "No injector factory bound for Class<%1$s>. Injector factories were bound for supertypes of %1$s: %2$s. Did you mean to bind an injector factory for the subtype?";
    private final Map<String, Provider<AndroidInjector.Factory<?>>> injectorFactories;

    @Inject
    DispatchingAndroidInjector(Map<Class<?>, Provider<AndroidInjector.Factory<?>>> injectorFactoriesWithClassKeys, Map<String, Provider<AndroidInjector.Factory<?>>> injectorFactoriesWithStringKeys) {
        this.injectorFactories = merge(injectorFactoriesWithClassKeys, injectorFactoriesWithStringKeys);
    }

    /* JADX WARN: Multi-variable type inference failed */
    private static <C, V> Map<String, Provider<AndroidInjector.Factory<?>>> merge(Map<Class<? extends C>, V> classKeyedMap, Map<String, V> map) {
        if (classKeyedMap.isEmpty()) {
            return map;
        }
        Map<String, V> merged = DaggerCollections.newLinkedHashMapWithExpectedSize(classKeyedMap.size() + map.size());
        merged.putAll(map);
        for (Map.Entry<Class<? extends C>, V> entry : classKeyedMap.entrySet()) {
            merged.put(entry.getKey().getName(), entry.getValue());
        }
        return Collections.unmodifiableMap(merged);
    }

    public boolean maybeInject(T instance) {
        Provider<AndroidInjector.Factory<?>> factoryProvider = this.injectorFactories.get(instance.getClass().getName());
        if (factoryProvider == null) {
            return false;
        }
        AndroidInjector.Factory<?> factory = factoryProvider.get();
        try {
            AndroidInjector<T> injector = (AndroidInjector) Preconditions.checkNotNull(factory.create(instance), "%s.create(I) should not return null.", factory.getClass());
            injector.inject(instance);
            return true;
        } catch (ClassCastException e) {
            throw new InvalidInjectorBindingException(String.format("%s does not implement AndroidInjector.Factory<%s>", factory.getClass().getCanonicalName(), instance.getClass().getCanonicalName()), e);
        }
    }

    @Override // dagger.android.AndroidInjector
    public void inject(T instance) {
        boolean wasInjected = maybeInject(instance);
        if (!wasInjected) {
            throw new IllegalArgumentException(errorMessageSuggestions(instance));
        }
    }

    public static final class InvalidInjectorBindingException extends RuntimeException {
        InvalidInjectorBindingException(String message, ClassCastException cause) {
            super(message, cause);
        }
    }

    private String errorMessageSuggestions(T instance) {
        List<String> suggestions = new ArrayList<>();
        for (Class<?> clazz = instance.getClass(); clazz != null; clazz = clazz.getSuperclass()) {
            if (this.injectorFactories.containsKey(clazz.getCanonicalName())) {
                suggestions.add(clazz.getCanonicalName());
            }
        }
        return suggestions.isEmpty() ? String.format(NO_SUPERTYPES_BOUND_FORMAT, instance.getClass().getCanonicalName()) : String.format(SUPERTYPES_BOUND_FORMAT, instance.getClass().getCanonicalName(), suggestions);
    }
}
