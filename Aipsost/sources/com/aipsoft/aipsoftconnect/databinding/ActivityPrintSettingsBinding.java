package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class ActivityPrintSettingsBinding implements ViewBinding {
    public final LinearLayout arrow;
    public final ImageView backButton;
    public final LinearLayout headingLayout;
    public final LinearLayout printer;
    public final LinearLayout printerType;
    public final LinearLayout printerarrow;
    public final TextView printername;
    public final TextView printertype;
    private final ConstraintLayout rootView;
    public final TextView title;

    private ActivityPrintSettingsBinding(ConstraintLayout rootView, LinearLayout arrow, ImageView backButton, LinearLayout headingLayout, LinearLayout printer, LinearLayout printerType, LinearLayout printerarrow, TextView printername, TextView printertype, TextView title) {
        this.rootView = rootView;
        this.arrow = arrow;
        this.backButton = backButton;
        this.headingLayout = headingLayout;
        this.printer = printer;
        this.printerType = printerType;
        this.printerarrow = printerarrow;
        this.printername = printername;
        this.printertype = printertype;
        this.title = title;
    }

    @Override // androidx.viewbinding.ViewBinding
    public ConstraintLayout getRoot() {
        return this.rootView;
    }

    public static ActivityPrintSettingsBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static ActivityPrintSettingsBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.activity_print_settings, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static ActivityPrintSettingsBinding bind(View rootView) {
        int id = R.id.arrow;
        LinearLayout arrow = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
        if (arrow != null) {
            id = R.id.backButton;
            ImageView backButton = (ImageView) ViewBindings.findChildViewById(rootView, id);
            if (backButton != null) {
                id = R.id.heading_layout;
                LinearLayout headingLayout = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                if (headingLayout != null) {
                    id = R.id.printer;
                    LinearLayout printer = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                    if (printer != null) {
                        id = R.id.printer_type;
                        LinearLayout printerType = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                        if (printerType != null) {
                            id = R.id.printerarrow;
                            LinearLayout printerarrow = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                            if (printerarrow != null) {
                                id = R.id.printername;
                                TextView printername = (TextView) ViewBindings.findChildViewById(rootView, id);
                                if (printername != null) {
                                    id = R.id.printertype;
                                    TextView printertype = (TextView) ViewBindings.findChildViewById(rootView, id);
                                    if (printertype != null) {
                                        id = R.id.title;
                                        TextView title = (TextView) ViewBindings.findChildViewById(rootView, id);
                                        if (title != null) {
                                            return new ActivityPrintSettingsBinding((ConstraintLayout) rootView, arrow, backButton, headingLayout, printer, printerType, printerarrow, printername, printertype, title);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
