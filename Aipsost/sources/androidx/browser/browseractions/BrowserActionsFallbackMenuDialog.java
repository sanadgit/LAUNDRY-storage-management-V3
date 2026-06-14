package androidx.browser.browseractions;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.app.Dialog;
import android.content.Context;
import android.graphics.drawable.ColorDrawable;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import androidx.interpolator.view.animation.LinearOutSlowInInterpolator;

/* JADX INFO: loaded from: classes.dex */
@Deprecated
class BrowserActionsFallbackMenuDialog extends Dialog {
    private static final long ENTER_ANIMATION_DURATION_MS = 250;
    private static final long EXIT_ANIMATION_DURATION_MS = 150;
    private final View mContentView;

    BrowserActionsFallbackMenuDialog(Context context, View contentView) {
        super(context);
        this.mContentView = contentView;
    }

    @Override // android.app.Dialog
    public void show() {
        Window dialogWindow = getWindow();
        dialogWindow.setBackgroundDrawable(new ColorDrawable(0));
        startAnimation(true);
        super.show();
    }

    @Override // android.app.Dialog
    public boolean onTouchEvent(MotionEvent event) {
        if (event.getAction() == 0) {
            dismiss();
            return true;
        }
        return false;
    }

    @Override // android.app.Dialog, android.content.DialogInterface
    public void dismiss() {
        startAnimation(false);
    }

    private void startAnimation(final boolean isEnterAnimation) {
        float from = isEnterAnimation ? 0.0f : 1.0f;
        float to = isEnterAnimation ? 1.0f : 0.0f;
        long duration = isEnterAnimation ? ENTER_ANIMATION_DURATION_MS : 150L;
        this.mContentView.setScaleX(from);
        this.mContentView.setScaleY(from);
        this.mContentView.animate().scaleX(to).scaleY(to).setDuration(duration).setInterpolator(new LinearOutSlowInInterpolator()).setListener(new AnimatorListenerAdapter() { // from class: androidx.browser.browseractions.BrowserActionsFallbackMenuDialog.1
            @Override // android.animation.AnimatorListenerAdapter, android.animation.Animator.AnimatorListener
            public void onAnimationEnd(Animator animation) {
                if (!isEnterAnimation) {
                    BrowserActionsFallbackMenuDialog.super.dismiss();
                }
            }
        }).start();
    }
}
