package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;
import com.journeyapps.barcodescanner.BarcodeView;
import com.journeyapps.barcodescanner.ViewfinderView;

/* JADX INFO: loaded from: classes3.dex */
public final class CustomScannerBinding implements ViewBinding {
    private final View rootView;
    public final BarcodeView zxingBarcodeSurface;
    public final ViewfinderView zxingViewfinderView;

    private CustomScannerBinding(View rootView, BarcodeView zxingBarcodeSurface, ViewfinderView zxingViewfinderView) {
        this.rootView = rootView;
        this.zxingBarcodeSurface = zxingBarcodeSurface;
        this.zxingViewfinderView = zxingViewfinderView;
    }

    @Override // androidx.viewbinding.ViewBinding
    public View getRoot() {
        return this.rootView;
    }

    public static CustomScannerBinding inflate(LayoutInflater inflater, ViewGroup parent) {
        if (parent == null) {
            throw new NullPointerException("parent");
        }
        inflater.inflate(R.layout.custom_scanner, parent);
        return bind(parent);
    }

    public static CustomScannerBinding bind(View rootView) {
        int id = R.id.zxing_barcode_surface;
        BarcodeView zxingBarcodeSurface = (BarcodeView) ViewBindings.findChildViewById(rootView, id);
        if (zxingBarcodeSurface != null) {
            id = R.id.zxing_viewfinder_view;
            ViewfinderView zxingViewfinderView = (ViewfinderView) ViewBindings.findChildViewById(rootView, id);
            if (zxingViewfinderView != null) {
                return new CustomScannerBinding(rootView, zxingBarcodeSurface, zxingViewfinderView);
            }
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
