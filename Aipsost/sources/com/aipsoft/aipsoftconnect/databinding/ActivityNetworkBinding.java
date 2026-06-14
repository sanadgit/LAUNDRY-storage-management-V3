package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class ActivityNetworkBinding implements ViewBinding {
    public final ImageView close;
    public final Button connectButton;
    public final Button disconnectButton;
    public final LinearLayout headingLayout;
    public final EditText ip1;
    public final EditText ip2;
    public final EditText ip3;
    public final EditText ip4;
    public final EditText port;
    private final ConstraintLayout rootView;
    public final Button save;
    public final Button testprint;
    public final TextView title;

    private ActivityNetworkBinding(ConstraintLayout rootView, ImageView close, Button connectButton, Button disconnectButton, LinearLayout headingLayout, EditText ip1, EditText ip2, EditText ip3, EditText ip4, EditText port, Button save, Button testprint, TextView title) {
        this.rootView = rootView;
        this.close = close;
        this.connectButton = connectButton;
        this.disconnectButton = disconnectButton;
        this.headingLayout = headingLayout;
        this.ip1 = ip1;
        this.ip2 = ip2;
        this.ip3 = ip3;
        this.ip4 = ip4;
        this.port = port;
        this.save = save;
        this.testprint = testprint;
        this.title = title;
    }

    @Override // androidx.viewbinding.ViewBinding
    public ConstraintLayout getRoot() {
        return this.rootView;
    }

    public static ActivityNetworkBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static ActivityNetworkBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.activity_network, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static ActivityNetworkBinding bind(View rootView) {
        int id = R.id.close;
        ImageView close = (ImageView) ViewBindings.findChildViewById(rootView, id);
        if (close != null) {
            id = R.id.connectButton;
            Button connectButton = (Button) ViewBindings.findChildViewById(rootView, id);
            if (connectButton != null) {
                id = R.id.disconnectButton;
                Button disconnectButton = (Button) ViewBindings.findChildViewById(rootView, id);
                if (disconnectButton != null) {
                    id = R.id.heading_layout;
                    LinearLayout headingLayout = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                    if (headingLayout != null) {
                        id = R.id.ip1;
                        EditText ip1 = (EditText) ViewBindings.findChildViewById(rootView, id);
                        if (ip1 != null) {
                            id = R.id.ip2;
                            EditText ip2 = (EditText) ViewBindings.findChildViewById(rootView, id);
                            if (ip2 != null) {
                                id = R.id.ip3;
                                EditText ip3 = (EditText) ViewBindings.findChildViewById(rootView, id);
                                if (ip3 != null) {
                                    id = R.id.ip4;
                                    EditText ip4 = (EditText) ViewBindings.findChildViewById(rootView, id);
                                    if (ip4 != null) {
                                        id = R.id.port;
                                        EditText port = (EditText) ViewBindings.findChildViewById(rootView, id);
                                        if (port != null) {
                                            id = R.id.save;
                                            Button save = (Button) ViewBindings.findChildViewById(rootView, id);
                                            if (save != null) {
                                                id = R.id.testprint;
                                                Button testprint = (Button) ViewBindings.findChildViewById(rootView, id);
                                                if (testprint != null) {
                                                    id = R.id.title;
                                                    TextView title = (TextView) ViewBindings.findChildViewById(rootView, id);
                                                    if (title != null) {
                                                        return new ActivityNetworkBinding((ConstraintLayout) rootView, close, connectButton, disconnectButton, headingLayout, ip1, ip2, ip3, ip4, port, save, testprint, title);
                                                    }
                                                }
                                            }
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
