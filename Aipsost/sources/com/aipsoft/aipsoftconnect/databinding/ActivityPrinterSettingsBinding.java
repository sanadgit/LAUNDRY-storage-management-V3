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
public final class ActivityPrinterSettingsBinding implements ViewBinding {
    public final ImageView back;
    public final TextView bluetoothDetails;
    public final LinearLayout bluetoothPrinter;
    public final LinearLayout headingLayout;
    public final TextView networkDetails;
    public final LinearLayout networkPrinter;
    private final ConstraintLayout rootView;
    public final TextView title;
    public final TextView title1;

    private ActivityPrinterSettingsBinding(ConstraintLayout rootView, ImageView back, TextView bluetoothDetails, LinearLayout bluetoothPrinter, LinearLayout headingLayout, TextView networkDetails, LinearLayout networkPrinter, TextView title, TextView title1) {
        this.rootView = rootView;
        this.back = back;
        this.bluetoothDetails = bluetoothDetails;
        this.bluetoothPrinter = bluetoothPrinter;
        this.headingLayout = headingLayout;
        this.networkDetails = networkDetails;
        this.networkPrinter = networkPrinter;
        this.title = title;
        this.title1 = title1;
    }

    @Override // androidx.viewbinding.ViewBinding
    public ConstraintLayout getRoot() {
        return this.rootView;
    }

    public static ActivityPrinterSettingsBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static ActivityPrinterSettingsBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.activity_printer_settings, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static ActivityPrinterSettingsBinding bind(View rootView) {
        int id = R.id.back;
        ImageView back = (ImageView) ViewBindings.findChildViewById(rootView, id);
        if (back != null) {
            id = R.id.bluetooth_details;
            TextView bluetoothDetails = (TextView) ViewBindings.findChildViewById(rootView, id);
            if (bluetoothDetails != null) {
                id = R.id.bluetooth_printer;
                LinearLayout bluetoothPrinter = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                if (bluetoothPrinter != null) {
                    id = R.id.heading_layout;
                    LinearLayout headingLayout = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                    if (headingLayout != null) {
                        id = R.id.network_details;
                        TextView networkDetails = (TextView) ViewBindings.findChildViewById(rootView, id);
                        if (networkDetails != null) {
                            id = R.id.network_printer;
                            LinearLayout networkPrinter = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                            if (networkPrinter != null) {
                                id = R.id.title;
                                TextView title = (TextView) ViewBindings.findChildViewById(rootView, id);
                                if (title != null) {
                                    id = R.id.title1;
                                    TextView title1 = (TextView) ViewBindings.findChildViewById(rootView, id);
                                    if (title1 != null) {
                                        return new ActivityPrinterSettingsBinding((ConstraintLayout) rootView, back, bluetoothDetails, bluetoothPrinter, headingLayout, networkDetails, networkPrinter, title, title1);
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
