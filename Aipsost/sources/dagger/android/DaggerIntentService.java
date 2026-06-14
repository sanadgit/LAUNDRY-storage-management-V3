package dagger.android;

import android.app.IntentService;

/* JADX INFO: loaded from: classes11.dex */
public abstract class DaggerIntentService extends IntentService {
    public DaggerIntentService(String name) {
        super(name);
    }

    @Override // android.app.IntentService, android.app.Service
    public void onCreate() {
        AndroidInjection.inject(this);
        super.onCreate();
    }
}
