package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class ActivitySplashBinding implements ViewBinding {
    public final ImageView gifImage;
    public final ImageView logoImage;
    private final ConstraintLayout rootView;

    private ActivitySplashBinding(ConstraintLayout rootView, ImageView gifImage, ImageView logoImage) {
        this.rootView = rootView;
        this.gifImage = gifImage;
        this.logoImage = logoImage;
    }

    @Override // androidx.viewbinding.ViewBinding
    public ConstraintLayout getRoot() {
        return this.rootView;
    }

    public static ActivitySplashBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static ActivitySplashBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.activity_splash, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static ActivitySplashBinding bind(View rootView) {
        int id = R.id.gifImage;
        ImageView gifImage = (ImageView) ViewBindings.findChildViewById(rootView, id);
        if (gifImage != null) {
            id = R.id.logoImage;
            ImageView logoImage = (ImageView) ViewBindings.findChildViewById(rootView, id);
            if (logoImage != null) {
                return new ActivitySplashBinding((ConstraintLayout) rootView, gifImage, logoImage);
            }
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
