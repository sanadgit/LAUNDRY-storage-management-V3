package dagger.internal;

import dagger.Lazy;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DoubleCheck<T> implements Provider<T>, Lazy<T> {
    static final /* synthetic */ boolean $assertionsDisabled = false;
    private static final Object UNINITIALIZED = new Object();
    private volatile Object instance = UNINITIALIZED;
    private volatile Provider<T> provider;

    private DoubleCheck(Provider<T> provider) {
        if (provider == null) {
            throw new AssertionError();
        }
        this.provider = provider;
    }

    @Override // javax.inject.Provider
    public T get() {
        T t = (T) this.instance;
        Object obj = UNINITIALIZED;
        if (t == obj) {
            synchronized (this) {
                t = this.instance;
                if (t == obj) {
                    t = this.provider.get();
                    this.instance = reentrantCheck(this.instance, t);
                    this.provider = null;
                }
            }
        }
        return (T) t;
    }

    private static Object reentrantCheck(Object currentInstance, Object newInstance) {
        boolean isReentrant = currentInstance != UNINITIALIZED;
        if (isReentrant && currentInstance != newInstance) {
            throw new IllegalStateException("Scoped provider was invoked recursively returning different results: " + currentInstance + " & " + newInstance + ". This is likely due to a circular dependency.");
        }
        return newInstance;
    }

    public static <P extends Provider<T>, T> Provider<T> provider(P delegate) {
        Preconditions.checkNotNull(delegate);
        if (delegate instanceof DoubleCheck) {
            return delegate;
        }
        return new DoubleCheck(delegate);
    }

    public static <P extends Provider<T>, T> Lazy<T> lazy(P provider) {
        if (provider instanceof Lazy) {
            Lazy<T> lazy = (Lazy) provider;
            return lazy;
        }
        return new DoubleCheck((Provider) Preconditions.checkNotNull(provider));
    }
}
