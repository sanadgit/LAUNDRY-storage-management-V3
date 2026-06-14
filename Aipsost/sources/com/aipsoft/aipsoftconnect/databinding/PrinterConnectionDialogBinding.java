package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class PrinterConnectionDialogBinding implements ViewBinding {
    private final ConstraintLayout rootView;
    public final TextView sutitle;
    public final TextView title;

    private PrinterConnectionDialogBinding(ConstraintLayout rootView, TextView sutitle, TextView title) {
        this.rootView = rootView;
        this.sutitle = sutitle;
        this.title = title;
    }

    @Override // androidx.viewbinding.ViewBinding
    public ConstraintLayout getRoot() {
        return this.rootView;
    }

    public static PrinterConnectionDialogBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static PrinterConnectionDialogBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.printer_connection_dialog, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static PrinterConnectionDialogBinding bind(View rootView) {
        int id = R.id.sutitle;
        TextView sutitle = (TextView) ViewBindings.findChildViewById(rootView, id);
        if (sutitle != null) {
            id = R.id.title;
            TextView title = (TextView) ViewBindings.findChildViewById(rootView, id);
            if (title != null) {
                return new PrinterConnectionDialogBinding((ConstraintLayout) rootView, sutitle, title);
            }
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
