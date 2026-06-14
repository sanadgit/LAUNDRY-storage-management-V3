package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class DialogChooseBluetoothDeviceBinding implements ViewBinding {
    public final Button btnHide;
    public final ListView lvDialogChooseBluetoothDeviceFoundDevices;
    public final ListView lvDialogChooseBluetoothDevicePairedDevices;
    public final ProgressBar pbDialogChooseBluetoothDeviceProgressBar;
    private final LinearLayout rootView;
    public final TextView tvDialogChooseBluetoothDeviceFoundDevicesEmpty;
    public final TextView tvDialogChooseBluetoothDevicePairedDevicesEmpty;
    public final TextView tvDialogChooseBluetoothDeviceSearchDevice;

    private DialogChooseBluetoothDeviceBinding(LinearLayout rootView, Button btnHide, ListView lvDialogChooseBluetoothDeviceFoundDevices, ListView lvDialogChooseBluetoothDevicePairedDevices, ProgressBar pbDialogChooseBluetoothDeviceProgressBar, TextView tvDialogChooseBluetoothDeviceFoundDevicesEmpty, TextView tvDialogChooseBluetoothDevicePairedDevicesEmpty, TextView tvDialogChooseBluetoothDeviceSearchDevice) {
        this.rootView = rootView;
        this.btnHide = btnHide;
        this.lvDialogChooseBluetoothDeviceFoundDevices = lvDialogChooseBluetoothDeviceFoundDevices;
        this.lvDialogChooseBluetoothDevicePairedDevices = lvDialogChooseBluetoothDevicePairedDevices;
        this.pbDialogChooseBluetoothDeviceProgressBar = pbDialogChooseBluetoothDeviceProgressBar;
        this.tvDialogChooseBluetoothDeviceFoundDevicesEmpty = tvDialogChooseBluetoothDeviceFoundDevicesEmpty;
        this.tvDialogChooseBluetoothDevicePairedDevicesEmpty = tvDialogChooseBluetoothDevicePairedDevicesEmpty;
        this.tvDialogChooseBluetoothDeviceSearchDevice = tvDialogChooseBluetoothDeviceSearchDevice;
    }

    @Override // androidx.viewbinding.ViewBinding
    public LinearLayout getRoot() {
        return this.rootView;
    }

    public static DialogChooseBluetoothDeviceBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static DialogChooseBluetoothDeviceBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.dialog_choose_bluetooth_device, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static DialogChooseBluetoothDeviceBinding bind(View rootView) {
        int id = R.id.btn_hide;
        Button btnHide = (Button) ViewBindings.findChildViewById(rootView, id);
        if (btnHide != null) {
            id = R.id.lv_dialog_choose_bluetooth_device_found_devices;
            ListView lvDialogChooseBluetoothDeviceFoundDevices = (ListView) ViewBindings.findChildViewById(rootView, id);
            if (lvDialogChooseBluetoothDeviceFoundDevices != null) {
                id = R.id.lv_dialog_choose_bluetooth_device_paired_devices;
                ListView lvDialogChooseBluetoothDevicePairedDevices = (ListView) ViewBindings.findChildViewById(rootView, id);
                if (lvDialogChooseBluetoothDevicePairedDevices != null) {
                    id = R.id.pb_dialog_choose_bluetooth_device_progress_bar;
                    ProgressBar pbDialogChooseBluetoothDeviceProgressBar = (ProgressBar) ViewBindings.findChildViewById(rootView, id);
                    if (pbDialogChooseBluetoothDeviceProgressBar != null) {
                        id = R.id.tv_dialog_choose_bluetooth_device_found_devices_empty;
                        TextView tvDialogChooseBluetoothDeviceFoundDevicesEmpty = (TextView) ViewBindings.findChildViewById(rootView, id);
                        if (tvDialogChooseBluetoothDeviceFoundDevicesEmpty != null) {
                            id = R.id.tv_dialog_choose_bluetooth_device_paired_devices_empty;
                            TextView tvDialogChooseBluetoothDevicePairedDevicesEmpty = (TextView) ViewBindings.findChildViewById(rootView, id);
                            if (tvDialogChooseBluetoothDevicePairedDevicesEmpty != null) {
                                id = R.id.tv_dialog_choose_bluetooth_device_search_device;
                                TextView tvDialogChooseBluetoothDeviceSearchDevice = (TextView) ViewBindings.findChildViewById(rootView, id);
                                if (tvDialogChooseBluetoothDeviceSearchDevice != null) {
                                    return new DialogChooseBluetoothDeviceBinding((LinearLayout) rootView, btnHide, lvDialogChooseBluetoothDeviceFoundDevices, lvDialogChooseBluetoothDevicePairedDevices, pbDialogChooseBluetoothDeviceProgressBar, tvDialogChooseBluetoothDeviceFoundDevicesEmpty, tvDialogChooseBluetoothDevicePairedDevicesEmpty, tvDialogChooseBluetoothDeviceSearchDevice);
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
