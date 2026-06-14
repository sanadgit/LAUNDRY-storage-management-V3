package dagger.internal;

import dagger.MembersInjector;

/* JADX INFO: loaded from: classes11.dex */
public final class MembersInjectors {
    public static <T> MembersInjector<T> noOp() {
        return NoOpMembersInjector.INSTANCE;
    }

    private enum NoOpMembersInjector implements MembersInjector<Object> {
        INSTANCE;

        @Override // dagger.MembersInjector
        public void injectMembers(Object instance) {
            Preconditions.checkNotNull(instance, "Cannot inject members into a null reference");
        }
    }

    private MembersInjectors() {
    }
}
