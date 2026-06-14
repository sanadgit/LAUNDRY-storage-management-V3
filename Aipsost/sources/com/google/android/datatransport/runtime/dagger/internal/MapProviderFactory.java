package com.google.android.datatransport.runtime.dagger.internal;

import com.google.android.datatransport.runtime.dagger.Lazy;
import com.google.android.datatransport.runtime.dagger.internal.AbstractMapFactory;
import java.util.Map;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes.dex */
public final class MapProviderFactory<K, V> extends AbstractMapFactory<K, V, Provider<V>> implements Lazy<Map<K, Provider<V>>> {
    public static <K, V> Builder<K, V> builder(int size) {
        return new Builder<>(size);
    }

    private MapProviderFactory(Map<K, Provider<V>> contributingMap) {
        super(contributingMap);
    }

    @Override // javax.inject.Provider
    public Map<K, Provider<V>> get() {
        return contributingMap();
    }

    public static final class Builder<K, V> extends AbstractMapFactory.Builder<K, V, Provider<V>> {
        private Builder(int size) {
            super(size);
        }

        @Override // com.google.android.datatransport.runtime.dagger.internal.AbstractMapFactory.Builder
        public Builder<K, V> put(K key, Provider<V> providerOfValue) {
            super.put((Object) key, (Provider) providerOfValue);
            return this;
        }

        /* JADX WARN: Multi-variable type inference failed */
        @Override // com.google.android.datatransport.runtime.dagger.internal.AbstractMapFactory.Builder
        public Builder<K, V> putAll(Provider<Map<K, Provider<V>>> provider) {
            super.putAll((Provider) provider);
            return this;
        }

        public MapProviderFactory<K, V> build() {
            return new MapProviderFactory<>(this.map);
        }
    }
}
