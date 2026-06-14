package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class BluetoothDeviceItemBinding implements ViewBinding {
    private final RelativeLayout rootView;
    public final TextView tvBluetoothDeviceName;

    private BluetoothDeviceItemBinding(RelativeLayout rootView, TextView tvBluetoothDeviceName) {
        this.rootView = rootView;
        this.tvBluetoothDeviceName = tvBluetoothDeviceName;
    }

    @Override // androidx.viewbinding.ViewBinding
    public RelativeLayout getRoot() {
        return this.rootView;
    }

    public static BluetoothDeviceItemBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static BluetoothDeviceItemBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.bluetooth_device_item, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static BluetoothDeviceItemBinding bind(View rootView) {
        int id = R.id.tv_bluetooth_device_name;
        TextView tvBluetoothDeviceName = (TextView) ViewBindings.findChildViewById(rootView, id);
        if (tvBluetoothDeviceName != null) {
            return new BluetoothDeviceItemBinding((RelativeLayout) rootView, tvBluetoothDeviceName);
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
