package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class ActivityBluetoothPrinterBinding implements ViewBinding {
    public final ImageView back;
    public final Button close;
    public final Button connectButton;
    public final LinearLayout connectDevice;
    public final TextView deviceName;
    public final Button disconnectButton;
    public final LinearLayout headingLayout;
    private final ConstraintLayout rootView;
    public final Button testprint;
    public final TextView title;

    private ActivityBluetoothPrinterBinding(ConstraintLayout rootView, ImageView back, Button close, Button connectButton, LinearLayout connectDevice, TextView deviceName, Button disconnectButton, LinearLayout headingLayout, Button testprint, TextView title) {
        this.rootView = rootView;
        this.back = back;
        this.close = close;
        this.connectButton = connectButton;
        this.connectDevice = connectDevice;
        this.deviceName = deviceName;
        this.disconnectButton = disconnectButton;
        this.headingLayout = headingLayout;
        this.testprint = testprint;
        this.title = title;
    }

    @Override // androidx.viewbinding.ViewBinding
    public ConstraintLayout getRoot() {
        return this.rootView;
    }

    public static ActivityBluetoothPrinterBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static ActivityBluetoothPrinterBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.activity_bluetooth_printer, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static ActivityBluetoothPrinterBinding bind(View rootView) {
        int id = R.id.back;
        ImageView back = (ImageView) ViewBindings.findChildViewById(rootView, id);
        if (back != null) {
            id = R.id.close;
            Button close = (Button) ViewBindings.findChildViewById(rootView, id);
            if (close != null) {
                id = R.id.connectButton;
                Button connectButton = (Button) ViewBindings.findChildViewById(rootView, id);
                if (connectButton != null) {
                    id = R.id.connectDevice;
                    LinearLayout connectDevice = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                    if (connectDevice != null) {
                        id = R.id.deviceName;
                        TextView deviceName = (TextView) ViewBindings.findChildViewById(rootView, id);
                        if (deviceName != null) {
                            id = R.id.disconnectButton;
                            Button disconnectButton = (Button) ViewBindings.findChildViewById(rootView, id);
                            if (disconnectButton != null) {
                                id = R.id.heading_layout;
                                LinearLayout headingLayout = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                                if (headingLayout != null) {
                                    id = R.id.testprint;
                                    Button testprint = (Button) ViewBindings.findChildViewById(rootView, id);
                                    if (testprint != null) {
                                        id = R.id.title;
                                        TextView title = (TextView) ViewBindings.findChildViewById(rootView, id);
                                        if (title != null) {
                                            return new ActivityBluetoothPrinterBinding((ConstraintLayout) rootView, back, close, connectButton, connectDevice, deviceName, disconnectButton, headingLayout, testprint, title);
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
