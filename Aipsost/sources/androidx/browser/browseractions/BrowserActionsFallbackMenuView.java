package androidx.browser.browseractions;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.widget.LinearLayout;
import androidx.browser.R;
import androidx.constraintlayout.solver.widgets.analyzer.BasicMeasure;

/* JADX INFO: loaded from: classes.dex */
@Deprecated
public class BrowserActionsFallbackMenuView extends LinearLayout {
    private final int mBrowserActionsMenuMaxWidthPx;
    private final int mBrowserActionsMenuMinPaddingPx;

    public BrowserActionsFallbackMenuView(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.mBrowserActionsMenuMinPaddingPx = getResources().getDimensionPixelOffset(R.dimen.browser_actions_context_menu_min_padding);
        this.mBrowserActionsMenuMaxWidthPx = getResources().getDimensionPixelOffset(R.dimen.browser_actions_context_menu_max_width);
    }

    @Override // android.widget.LinearLayout, android.view.View
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int appWindowWidthPx = getResources().getDisplayMetrics().widthPixels;
        int contextMenuWidth = Math.min(appWindowWidthPx - (this.mBrowserActionsMenuMinPaddingPx * 2), this.mBrowserActionsMenuMaxWidthPx);
        int widthMeasureSpec2 = View.MeasureSpec.makeMeasureSpec(contextMenuWidth, BasicMeasure.EXACTLY);
        super.onMeasure(widthMeasureSpec2, heightMeasureSpec);
    }
}
