package dagger.android;

import android.app.Activity;
import android.os.Bundle;
import javax.inject.Inject;

/* JADX INFO: loaded from: classes11.dex */
public abstract class DaggerActivity extends Activity implements HasAndroidInjector {

    @Inject
    DispatchingAndroidInjector<Object> androidInjector;

    @Override // android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        AndroidInjection.inject(this);
        super.onCreate(savedInstanceState);
    }

    @Override // dagger.android.HasAndroidInjector
    public AndroidInjector<Object> androidInjector() {
        return this.androidInjector;
    }
}
