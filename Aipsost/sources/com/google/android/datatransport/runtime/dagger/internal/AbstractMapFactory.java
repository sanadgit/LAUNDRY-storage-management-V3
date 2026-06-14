package com.google.android.datatransport.runtime.dagger.internal;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes.dex */
abstract class AbstractMapFactory<K, V, V2> implements Factory<Map<K, V2>> {
    private final Map<K, Provider<V>> contributingMap;

    AbstractMapFactory(Map<K, Provider<V>> map) {
        this.contributingMap = Collections.unmodifiableMap(map);
    }

    final Map<K, Provider<V>> contributingMap() {
        return this.contributingMap;
    }

    public static abstract class Builder<K, V, V2> {
        final LinkedHashMap<K, Provider<V>> map;

        Builder(int size) {
            this.map = DaggerCollections.newLinkedHashMapWithExpectedSize(size);
        }

        Builder<K, V, V2> put(K k, Provider<V> provider) {
            this.map.put((K) Preconditions.checkNotNull(k, "key"), (Provider<V>) Preconditions.checkNotNull(provider, "provider"));
            return this;
        }

        Builder<K, V, V2> putAll(Provider<Map<K, V2>> mapOfProviders) {
            if (mapOfProviders instanceof DelegateFactory) {
                DelegateFactory<Map<K, V2>> asDelegateFactory = (DelegateFactory) mapOfProviders;
                return putAll(asDelegateFactory.getDelegate());
            }
            AbstractMapFactory<K, V, ?> asAbstractMapFactory = (AbstractMapFactory) mapOfProviders;
            this.map.putAll(((AbstractMapFactory) asAbstractMapFactory).contributingMap);
            return this;
        }
    }
}
