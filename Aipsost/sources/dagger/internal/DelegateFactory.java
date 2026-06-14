package dagger.internal;

import javax.inject.Provider;

/* JADX INFO: loaded from: classes11.dex */
public final class DelegateFactory<T> implements Factory<T> {
    private Provider<T> delegate;

    @Override // javax.inject.Provider
    public T get() {
        Provider<T> provider = this.delegate;
        if (provider == null) {
            throw new IllegalStateException();
        }
        return provider.get();
    }

    @Deprecated
    public void setDelegatedProvider(Provider<T> delegate) {
        setDelegate(this, delegate);
    }

    public static <T> void setDelegate(Provider<T> delegateFactory, Provider<T> delegate) {
        Preconditions.checkNotNull(delegate);
        DelegateFactory<T> asDelegateFactory = (DelegateFactory) delegateFactory;
        if (((DelegateFactory) asDelegateFactory).delegate != null) {
            throw new IllegalStateException();
        }
        ((DelegateFactory) asDelegateFactory).delegate = delegate;
    }

    Provider<T> getDelegate() {
        return (Provider) Preconditions.checkNotNull(this.delegate);
    }
}
