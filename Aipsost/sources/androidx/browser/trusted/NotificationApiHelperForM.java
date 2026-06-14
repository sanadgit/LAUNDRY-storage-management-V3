package androidx.browser.trusted;

import android.app.NotificationManager;
import android.os.Parcelable;

/* JADX INFO: loaded from: classes.dex */
public class NotificationApiHelperForM {
    static Parcelable[] getActiveNotifications(NotificationManager manager) {
        return manager.getActiveNotifications();
    }

    private NotificationApiHelperForM() {
    }
}
