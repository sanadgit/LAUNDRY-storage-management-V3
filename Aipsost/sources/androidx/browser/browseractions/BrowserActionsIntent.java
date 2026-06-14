package androidx.browser.browseractions;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import androidx.core.content.ContextCompat;
import androidx.core.view.accessibility.AccessibilityEventCompat;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/* JADX INFO: loaded from: classes.dex */
@Deprecated
public class BrowserActionsIntent {
    public static final String ACTION_BROWSER_ACTIONS_OPEN = "androidx.browser.browseractions.browser_action_open";
    public static final String EXTRA_APP_ID = "androidx.browser.browseractions.APP_ID";
    public static final String EXTRA_MENU_ITEMS = "androidx.browser.browseractions.extra.MENU_ITEMS";
    public static final String EXTRA_SELECTED_ACTION_PENDING_INTENT = "androidx.browser.browseractions.extra.SELECTED_ACTION_PENDING_INTENT";
    public static final String EXTRA_TYPE = "androidx.browser.browseractions.extra.TYPE";
    public static final int ITEM_COPY = 3;
    public static final int ITEM_DOWNLOAD = 2;
    public static final int ITEM_INVALID_ITEM = -1;
    public static final int ITEM_OPEN_IN_INCOGNITO = 1;
    public static final int ITEM_OPEN_IN_NEW_TAB = 0;
    public static final int ITEM_SHARE = 4;
    public static final String KEY_ACTION = "androidx.browser.browseractions.ACTION";
    public static final String KEY_ICON_ID = "androidx.browser.browseractions.ICON_ID";
    private static final String KEY_ICON_URI = "androidx.browser.browseractions.ICON_URI";
    public static final String KEY_TITLE = "androidx.browser.browseractions.TITLE";
    public static final int MAX_CUSTOM_ITEMS = 5;
    private static final String TAG = "BrowserActions";
    private static final String TEST_URL = "https://www.example.com";
    public static final int URL_TYPE_AUDIO = 3;
    public static final int URL_TYPE_FILE = 4;
    public static final int URL_TYPE_IMAGE = 1;
    public static final int URL_TYPE_NONE = 0;
    public static final int URL_TYPE_PLUGIN = 5;
    public static final int URL_TYPE_VIDEO = 2;
    private static BrowserActionsFallDialogListener sDialogListenter;
    private final Intent mIntent;

    interface BrowserActionsFallDialogListener {
        void onDialogShown();
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface BrowserActionsItemId {
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface BrowserActionsUrlType {
    }

    public Intent getIntent() {
        return this.mIntent;
    }

    BrowserActionsIntent(Intent intent) {
        this.mIntent = intent;
    }

    public static final class Builder {
        private Context mContext;
        private Uri mUri;
        private final Intent mIntent = new Intent(BrowserActionsIntent.ACTION_BROWSER_ACTIONS_OPEN);
        private int mType = 0;
        private ArrayList<Bundle> mMenuItems = new ArrayList<>();
        private PendingIntent mOnItemSelectedPendingIntent = null;
        private List<Uri> mImageUris = new ArrayList();

        public Builder(Context context, Uri uri) {
            this.mContext = context;
            this.mUri = uri;
        }

        public Builder setUrlType(int type) {
            this.mType = type;
            return this;
        }

        public Builder setCustomItems(ArrayList<BrowserActionItem> items) {
            if (items.size() > 5) {
                throw new IllegalStateException("Exceeded maximum toolbar item count of 5");
            }
            for (int i = 0; i < items.size(); i++) {
                if (TextUtils.isEmpty(items.get(i).getTitle()) || items.get(i).getAction() == null) {
                    throw new IllegalArgumentException("Custom item should contain a non-empty title and non-null intent.");
                }
                this.mMenuItems.add(getBundleFromItem(items.get(i)));
                if (items.get(i).getIconUri() != null) {
                    this.mImageUris.add(items.get(i).getIconUri());
                }
            }
            return this;
        }

        public Builder setCustomItems(BrowserActionItem... items) {
            return setCustomItems(new ArrayList<>(Arrays.asList(items)));
        }

        public Builder setOnItemSelectedAction(PendingIntent onItemSelectedPendingIntent) {
            this.mOnItemSelectedPendingIntent = onItemSelectedPendingIntent;
            return this;
        }

        private Bundle getBundleFromItem(BrowserActionItem item) {
            Bundle bundle = new Bundle();
            bundle.putString(BrowserActionsIntent.KEY_TITLE, item.getTitle());
            bundle.putParcelable(BrowserActionsIntent.KEY_ACTION, item.getAction());
            if (item.getIconId() != 0) {
                bundle.putInt(BrowserActionsIntent.KEY_ICON_ID, item.getIconId());
            }
            if (item.getIconUri() != null) {
                bundle.putParcelable(BrowserActionsIntent.KEY_ICON_URI, item.getIconUri());
            }
            return bundle;
        }

        public BrowserActionsIntent build() {
            this.mIntent.setData(this.mUri);
            this.mIntent.putExtra(BrowserActionsIntent.EXTRA_TYPE, this.mType);
            this.mIntent.putParcelableArrayListExtra(BrowserActionsIntent.EXTRA_MENU_ITEMS, this.mMenuItems);
            PendingIntent pendingIntent = PendingIntent.getActivity(this.mContext, 0, new Intent(), AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL);
            this.mIntent.putExtra(BrowserActionsIntent.EXTRA_APP_ID, pendingIntent);
            PendingIntent pendingIntent2 = this.mOnItemSelectedPendingIntent;
            if (pendingIntent2 != null) {
                this.mIntent.putExtra(BrowserActionsIntent.EXTRA_SELECTED_ACTION_PENDING_INTENT, pendingIntent2);
            }
            BrowserServiceFileProvider.grantReadPermission(this.mIntent, this.mImageUris, this.mContext);
            return new BrowserActionsIntent(this.mIntent);
        }
    }

    public static void openBrowserAction(Context context, Uri uri) {
        BrowserActionsIntent intent = new Builder(context, uri).build();
        launchIntent(context, intent.getIntent());
    }

    public static void openBrowserAction(Context context, Uri uri, int type, ArrayList<BrowserActionItem> items, PendingIntent pendingIntent) {
        BrowserActionsIntent intent = new Builder(context, uri).setUrlType(type).setCustomItems(items).setOnItemSelectedAction(pendingIntent).build();
        launchIntent(context, intent.getIntent());
    }

    public static void launchIntent(Context context, Intent intent) {
        List<ResolveInfo> handlers = getBrowserActionsIntentHandlers(context);
        launchIntent(context, intent, handlers);
    }

    static void launchIntent(Context context, Intent intent, List<ResolveInfo> handlers) {
        if (handlers == null || handlers.size() == 0) {
            openFallbackBrowserActionsMenu(context, intent);
            return;
        }
        if (handlers.size() == 1) {
            intent.setPackage(handlers.get(0).activityInfo.packageName);
        } else {
            Intent viewIntent = new Intent("android.intent.action.VIEW", Uri.parse(TEST_URL));
            PackageManager pm = context.getPackageManager();
            ResolveInfo defaultHandler = pm.resolveActivity(viewIntent, 65536);
            if (defaultHandler != null) {
                String defaultPackageName = defaultHandler.activityInfo.packageName;
                int i = 0;
                while (true) {
                    if (i >= handlers.size()) {
                        break;
                    }
                    if (!defaultPackageName.equals(handlers.get(i).activityInfo.packageName)) {
                        i++;
                    } else {
                        intent.setPackage(defaultPackageName);
                        break;
                    }
                }
            }
        }
        ContextCompat.startActivity(context, intent, null);
    }

    public static List<ResolveInfo> getBrowserActionsIntentHandlers(Context context) {
        Intent intent = new Intent(ACTION_BROWSER_ACTIONS_OPEN, Uri.parse(TEST_URL));
        PackageManager pm = context.getPackageManager();
        return pm.queryIntentActivities(intent, 131072);
    }

    private static void openFallbackBrowserActionsMenu(Context context, Intent intent) {
        Uri uri = intent.getData();
        ArrayList<Bundle> bundles = intent.getParcelableArrayListExtra(EXTRA_MENU_ITEMS);
        List<BrowserActionItem> items = bundles != null ? parseBrowserActionItems(bundles) : null;
        openFallbackBrowserActionsMenu(context, uri, items);
    }

    static void setDialogShownListenter(BrowserActionsFallDialogListener dialogListener) {
        sDialogListenter = dialogListener;
    }

    private static void openFallbackBrowserActionsMenu(Context context, Uri uri, List<BrowserActionItem> menuItems) {
        BrowserActionsFallbackMenuUi menuUi = new BrowserActionsFallbackMenuUi(context, uri, menuItems);
        menuUi.displayMenu();
        BrowserActionsFallDialogListener browserActionsFallDialogListener = sDialogListenter;
        if (browserActionsFallDialogListener != null) {
            browserActionsFallDialogListener.onDialogShown();
        }
    }

    public static List<BrowserActionItem> parseBrowserActionItems(ArrayList<Bundle> bundles) {
        BrowserActionItem item;
        List<BrowserActionItem> mActions = new ArrayList<>();
        for (int i = 0; i < bundles.size(); i++) {
            Bundle bundle = bundles.get(i);
            String title = bundle.getString(KEY_TITLE);
            PendingIntent action = (PendingIntent) bundle.getParcelable(KEY_ACTION);
            int iconId = bundle.getInt(KEY_ICON_ID);
            Uri iconUri = (Uri) bundle.getParcelable(KEY_ICON_URI);
            if (!TextUtils.isEmpty(title) && action != null) {
                if (iconId != 0) {
                    item = new BrowserActionItem(title, action, iconId);
                } else {
                    item = new BrowserActionItem(title, action, iconUri);
                }
                mActions.add(item);
            } else {
                throw new IllegalArgumentException("Custom item should contain a non-empty title and non-null intent.");
            }
        }
        return mActions;
    }

    public static String getUntrustedCreatorPackageName(Intent intent) {
        PendingIntent pendingIntent = (PendingIntent) intent.getParcelableExtra(EXTRA_APP_ID);
        if (pendingIntent != null) {
            return pendingIntent.getCreatorPackage();
        }
        return null;
    }

    @Deprecated
    public static String getCreatorPackageName(Intent intent) {
        return getUntrustedCreatorPackageName(intent);
    }
}
