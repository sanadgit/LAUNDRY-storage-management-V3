package androidx.browser.trusted;

import android.os.Bundle;

/* JADX INFO: loaded from: classes.dex */
public interface TrustedWebActivityDisplayMode {
    public static final String KEY_ID = "androidx.browser.trusted.displaymode.KEY_ID";

    Bundle toBundle();

    /* JADX INFO: renamed from: androidx.browser.trusted.TrustedWebActivityDisplayMode$-CC, reason: invalid class name */
    public final /* synthetic */ class CC {
        public static TrustedWebActivityDisplayMode fromBundle(Bundle bundle) {
            switch (bundle.getInt(TrustedWebActivityDisplayMode.KEY_ID)) {
                case 1:
                    return ImmersiveMode.fromBundle(bundle);
                default:
                    return new DefaultMode();
            }
        }
    }

    public static class DefaultMode implements TrustedWebActivityDisplayMode {
        private static final int ID = 0;

        @Override // androidx.browser.trusted.TrustedWebActivityDisplayMode
        public Bundle toBundle() {
            Bundle bundle = new Bundle();
            bundle.putInt(TrustedWebActivityDisplayMode.KEY_ID, 0);
            return bundle;
        }
    }

    public static class ImmersiveMode implements TrustedWebActivityDisplayMode {
        private static final int ID = 1;
        public static final String KEY_CUTOUT_MODE = "androidx.browser.trusted.displaymode.KEY_CUTOUT_MODE";
        public static final String KEY_STICKY = "androidx.browser.trusted.displaymode.KEY_STICKY";
        private final boolean mIsSticky;
        private final int mLayoutInDisplayCutoutMode;

        public ImmersiveMode(boolean isSticky, int layoutInDisplayCutoutMode) {
            this.mIsSticky = isSticky;
            this.mLayoutInDisplayCutoutMode = layoutInDisplayCutoutMode;
        }

        static TrustedWebActivityDisplayMode fromBundle(Bundle bundle) {
            return new ImmersiveMode(bundle.getBoolean(KEY_STICKY), bundle.getInt(KEY_CUTOUT_MODE));
        }

        @Override // androidx.browser.trusted.TrustedWebActivityDisplayMode
        public Bundle toBundle() {
            Bundle bundle = new Bundle();
            bundle.putInt(TrustedWebActivityDisplayMode.KEY_ID, 1);
            bundle.putBoolean(KEY_STICKY, this.mIsSticky);
            bundle.putInt(KEY_CUTOUT_MODE, this.mLayoutInDisplayCutoutMode);
            return bundle;
        }

        public boolean isSticky() {
            return this.mIsSticky;
        }

        public int layoutInDisplayCutoutMode() {
            return this.mLayoutInDisplayCutoutMode;
        }
    }
}
