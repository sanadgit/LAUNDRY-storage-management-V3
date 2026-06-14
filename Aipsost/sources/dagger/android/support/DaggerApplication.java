package dagger.android.support;

import dagger.android.AndroidInjector;

/* JADX INFO: loaded from: classes11.dex */
public abstract class DaggerApplication extends dagger.android.DaggerApplication {
    @Override // dagger.android.DaggerApplication
    protected abstract AndroidInjector<? extends DaggerApplication> applicationInjector();
}
