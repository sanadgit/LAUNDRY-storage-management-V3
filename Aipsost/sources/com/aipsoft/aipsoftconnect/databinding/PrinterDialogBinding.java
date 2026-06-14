package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class PrinterDialogBinding implements ViewBinding {
    public final LinearLayout backButton;
    public final RadioButton bluetooth;
    public final LinearLayout paymentBottomLayout;
    public final RadioGroup printerRadio;
    private final LinearLayout rootView;
    public final RadioButton wifi;

    private PrinterDialogBinding(LinearLayout rootView, LinearLayout backButton, RadioButton bluetooth, LinearLayout paymentBottomLayout, RadioGroup printerRadio, RadioButton wifi) {
        this.rootView = rootView;
        this.backButton = backButton;
        this.bluetooth = bluetooth;
        this.paymentBottomLayout = paymentBottomLayout;
        this.printerRadio = printerRadio;
        this.wifi = wifi;
    }

    @Override // androidx.viewbinding.ViewBinding
    public LinearLayout getRoot() {
        return this.rootView;
    }

    public static PrinterDialogBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static PrinterDialogBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.printer_dialog, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static PrinterDialogBinding bind(View rootView) {
        int id = R.id.backButton;
        LinearLayout backButton = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
        if (backButton != null) {
            id = R.id.bluetooth;
            RadioButton bluetooth = (RadioButton) ViewBindings.findChildViewById(rootView, id);
            if (bluetooth != null) {
                LinearLayout paymentBottomLayout = (LinearLayout) rootView;
                id = R.id.printer_radio;
                RadioGroup printerRadio = (RadioGroup) ViewBindings.findChildViewById(rootView, id);
                if (printerRadio != null) {
                    id = R.id.wifi;
                    RadioButton wifi = (RadioButton) ViewBindings.findChildViewById(rootView, id);
                    if (wifi != null) {
                        return new PrinterDialogBinding((LinearLayout) rootView, backButton, bluetooth, paymentBottomLayout, printerRadio, wifi);
                    }
                }
            }
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
