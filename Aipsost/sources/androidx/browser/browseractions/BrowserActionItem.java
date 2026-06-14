package androidx.browser.browseractions;

import android.app.PendingIntent;
import android.net.Uri;

/* JADX INFO: loaded from: classes.dex */
@Deprecated
public class BrowserActionItem {
    private final PendingIntent mAction;
    private int mIconId;
    private Uri mIconUri;
    private Runnable mRunnableAction;
    private final String mTitle;

    public BrowserActionItem(String title, PendingIntent action, int iconId) {
        this.mTitle = title;
        this.mAction = action;
        this.mIconId = iconId;
    }

    public BrowserActionItem(String title, PendingIntent action, Uri iconUri) {
        this.mTitle = title;
        this.mAction = action;
        this.mIconUri = iconUri;
    }

    BrowserActionItem(String title, Runnable action) {
        this.mTitle = title;
        this.mAction = null;
        this.mRunnableAction = action;
    }

    public BrowserActionItem(String title, PendingIntent action) {
        this(title, action, 0);
    }

    public int getIconId() {
        return this.mIconId;
    }

    public String getTitle() {
        return this.mTitle;
    }

    public PendingIntent getAction() {
        PendingIntent pendingIntent = this.mAction;
        if (pendingIntent == null) {
            throw new IllegalStateException("Can't call getAction on BrowserActionItem with null action.");
        }
        return pendingIntent;
    }

    public Uri getIconUri() {
        return this.mIconUri;
    }

    Runnable getRunnableAction() {
        return this.mRunnableAction;
    }
}
