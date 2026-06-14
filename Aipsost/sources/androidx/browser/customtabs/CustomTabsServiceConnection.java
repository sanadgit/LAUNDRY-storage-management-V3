package androidx.browser.customtabs;

import android.content.ComponentName;
import android.content.Context;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.support.customtabs.ICustomTabsService;

/* JADX INFO: loaded from: classes.dex */
public abstract class CustomTabsServiceConnection implements ServiceConnection {
    private Context mApplicationContext;

    public abstract void onCustomTabsServiceConnected(ComponentName componentName, CustomTabsClient customTabsClient);

    void setApplicationContext(Context context) {
        this.mApplicationContext = context;
    }

    Context getApplicationContext() {
        return this.mApplicationContext;
    }

    @Override // android.content.ServiceConnection
    public final void onServiceConnected(ComponentName name, IBinder service) {
        if (this.mApplicationContext == null) {
            throw new IllegalStateException("Custom Tabs Service connected before an applicationcontext has been provided.");
        }
        onCustomTabsServiceConnected(name, new CustomTabsClient(ICustomTabsService.Stub.asInterface(service), name, this.mApplicationContext) { // from class: androidx.browser.customtabs.CustomTabsServiceConnection.1
        });
    }
}
