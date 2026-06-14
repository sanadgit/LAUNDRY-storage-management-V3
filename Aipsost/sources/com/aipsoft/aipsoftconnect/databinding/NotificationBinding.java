package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class NotificationBinding implements ViewBinding {
    public final ImageView icon;
    public final LinearLayout linearLayout;
    public final TextView message;
    private final LinearLayout rootView;
    public final TextView title;

    private NotificationBinding(LinearLayout rootView, ImageView icon, LinearLayout linearLayout, TextView message, TextView title) {
        this.rootView = rootView;
        this.icon = icon;
        this.linearLayout = linearLayout;
        this.message = message;
        this.title = title;
    }

    @Override // androidx.viewbinding.ViewBinding
    public LinearLayout getRoot() {
        return this.rootView;
    }

    public static NotificationBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static NotificationBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.notification, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static NotificationBinding bind(View rootView) {
        int id = R.id.icon;
        ImageView icon = (ImageView) ViewBindings.findChildViewById(rootView, id);
        if (icon != null) {
            LinearLayout linearLayout = (LinearLayout) rootView;
            id = R.id.message;
            TextView message = (TextView) ViewBindings.findChildViewById(rootView, id);
            if (message != null) {
                id = R.id.title;
                TextView title = (TextView) ViewBindings.findChildViewById(rootView, id);
                if (title != null) {
                    return new NotificationBinding((LinearLayout) rootView, icon, linearLayout, message, title);
                }
            }
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
