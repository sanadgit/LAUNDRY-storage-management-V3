package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;
import com.google.android.material.card.MaterialCardView;

/* JADX INFO: loaded from: classes3.dex */
public final class DialogDeliveryPermissionBinding implements ViewBinding {
    public final MaterialCardView btnEnableLocationServices;
    public final Button btnProceed;
    public final MaterialCardView cardLocationPermission;
    public final MaterialCardView cardScheduleAlarm;
    private final MaterialCardView rootView;
    public final TextView tvDialogDescription;
    public final TextView tvDialogTitle;

    private DialogDeliveryPermissionBinding(MaterialCardView rootView, MaterialCardView btnEnableLocationServices, Button btnProceed, MaterialCardView cardLocationPermission, MaterialCardView cardScheduleAlarm, TextView tvDialogDescription, TextView tvDialogTitle) {
        this.rootView = rootView;
        this.btnEnableLocationServices = btnEnableLocationServices;
        this.btnProceed = btnProceed;
        this.cardLocationPermission = cardLocationPermission;
        this.cardScheduleAlarm = cardScheduleAlarm;
        this.tvDialogDescription = tvDialogDescription;
        this.tvDialogTitle = tvDialogTitle;
    }

    @Override // androidx.viewbinding.ViewBinding
    public MaterialCardView getRoot() {
        return this.rootView;
    }

    public static DialogDeliveryPermissionBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static DialogDeliveryPermissionBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.dialog_delivery_permission, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static DialogDeliveryPermissionBinding bind(View rootView) {
        int id = R.id.btnEnableLocationServices;
        MaterialCardView btnEnableLocationServices = (MaterialCardView) ViewBindings.findChildViewById(rootView, id);
        if (btnEnableLocationServices != null) {
            id = R.id.btnProceed;
            Button btnProceed = (Button) ViewBindings.findChildViewById(rootView, id);
            if (btnProceed != null) {
                id = R.id.cardLocationPermission;
                MaterialCardView cardLocationPermission = (MaterialCardView) ViewBindings.findChildViewById(rootView, id);
                if (cardLocationPermission != null) {
                    id = R.id.cardScheduleAlarm;
                    MaterialCardView cardScheduleAlarm = (MaterialCardView) ViewBindings.findChildViewById(rootView, id);
                    if (cardScheduleAlarm != null) {
                        id = R.id.tvDialogDescription;
                        TextView tvDialogDescription = (TextView) ViewBindings.findChildViewById(rootView, id);
                        if (tvDialogDescription != null) {
                            id = R.id.tvDialogTitle;
                            TextView tvDialogTitle = (TextView) ViewBindings.findChildViewById(rootView, id);
                            if (tvDialogTitle != null) {
                                return new DialogDeliveryPermissionBinding((MaterialCardView) rootView, btnEnableLocationServices, btnProceed, cardLocationPermission, cardScheduleAlarm, tvDialogDescription, tvDialogTitle);
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
