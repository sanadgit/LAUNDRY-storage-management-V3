package androidx.browser.trusted;

import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.support.customtabs.trusted.ITrustedWebActivityCallback;

/* JADX INFO: loaded from: classes.dex */
public class TrustedWebActivityCallbackRemote {
    private final ITrustedWebActivityCallback mCallbackBinder;

    private TrustedWebActivityCallbackRemote(ITrustedWebActivityCallback callbackBinder) {
        this.mCallbackBinder = callbackBinder;
    }

    static TrustedWebActivityCallbackRemote fromBinder(IBinder binder) {
        ITrustedWebActivityCallback callbackBinder;
        if (binder == null) {
            callbackBinder = null;
        } else {
            callbackBinder = ITrustedWebActivityCallback.Stub.asInterface(binder);
        }
        if (callbackBinder == null) {
            return null;
        }
        return new TrustedWebActivityCallbackRemote(callbackBinder);
    }

    public void runExtraCallback(String callbackName, Bundle args) throws RemoteException {
        this.mCallbackBinder.onExtraCallback(callbackName, args);
    }
}
