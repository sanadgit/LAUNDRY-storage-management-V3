package dagger.android;

import android.app.DialogFragment;
import android.content.Context;
import javax.inject.Inject;

/* JADX INFO: loaded from: classes11.dex */
@Deprecated
public abstract class DaggerDialogFragment extends DialogFragment implements HasAndroidInjector {

    @Inject
    DispatchingAndroidInjector<Object> androidInjector;

    @Override // android.app.DialogFragment, android.app.Fragment
    public void onAttach(Context context) {
        AndroidInjection.inject(this);
        super.onAttach(context);
    }

    @Override // dagger.android.HasAndroidInjector
    public AndroidInjector<Object> androidInjector() {
        return this.androidInjector;
    }
}
