package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;
import com.journeyapps.barcodescanner.DecoratedBarcodeView;

/* JADX INFO: loaded from: classes3.dex */
public final class ActivityScanBinding implements ViewBinding {
    public final LinearLayout closeButton;
    private final LinearLayout rootView;
    public final View view;
    public final DecoratedBarcodeView zxingBarcodeScanner;

    private ActivityScanBinding(LinearLayout rootView, LinearLayout closeButton, View view, DecoratedBarcodeView zxingBarcodeScanner) {
        this.rootView = rootView;
        this.closeButton = closeButton;
        this.view = view;
        this.zxingBarcodeScanner = zxingBarcodeScanner;
    }

    @Override // androidx.viewbinding.ViewBinding
    public LinearLayout getRoot() {
        return this.rootView;
    }

    public static ActivityScanBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static ActivityScanBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.activity_scan, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static ActivityScanBinding bind(View rootView) {
        View view;
        int id = R.id.closeButton;
        LinearLayout closeButton = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
        if (closeButton != null && (view = ViewBindings.findChildViewById(rootView, (id = R.id.view))) != null) {
            id = R.id.zxing_barcode_scanner;
            DecoratedBarcodeView zxingBarcodeScanner = (DecoratedBarcodeView) ViewBindings.findChildViewById(rootView, id);
            if (zxingBarcodeScanner != null) {
                return new ActivityScanBinding((LinearLayout) rootView, closeButton, view, zxingBarcodeScanner);
            }
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
