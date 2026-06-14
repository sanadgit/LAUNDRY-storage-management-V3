package com.aipsoft.aipsoftconnect.dialog;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.core.app.ActivityCompat;
import com.aipsoft.aipsoftconnect.R;
import com.aipsoft.aipsoftconnect.adapter.BluetoothDevicePrinterAdapter;
import java.util.ArrayList;
import java.util.List;

/* JADX INFO: loaded from: classes4.dex */
public class BluetoothDeviceChooseDialog extends DialogFragment {
    private Button btn_hide;
    private BluetoothDevicePrinterAdapter foundDeviceAdapter;
    private List<BluetoothDevice> foundDeviceList;
    private ListView lvFoundDevices;
    private ListView lvPairedDevices;
    private BluetoothAdapter mBluetoothAdapter;
    private IntentFilter mBluetoothIntentFilter;
    private BroadcastReceiver mBluetoothReceiver;
    private Context mContext;
    private onDeviceItemClickListener mListener;
    private BluetoothDevicePrinterAdapter pairedDeviceAdapter;
    private List<BluetoothDevice> pairedDeviceList;
    private ProgressBar progressBar;
    private TextView tvFoundDeviceEmpty;
    private TextView tvPairedDeviceEmpty;
    private TextView tvSearchDevice;
    private final String TAG = getClass().getSimpleName();
    private boolean mSearchInited = false;
    private boolean mRegistered = false;
    private boolean isHidePairedDevlist = false;

    public interface onDeviceItemClickListener {
        void onDeviceItemClick(BluetoothDevice bluetoothDevice);
    }

    @Override // android.app.Fragment
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        this.mContext = activity;
    }

    @Override // android.app.DialogFragment
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        LayoutInflater inflater = getActivity().getLayoutInflater();
        View view = inflater.inflate(R.layout.dialog_choose_bluetooth_device, (ViewGroup) null);
        initView(view);
        setListener();
        initData();
        AlertDialog.Builder builder = new AlertDialog.Builder(this.mContext);
        builder.setView(view).setCancelable(true).setNegativeButton(R.string.dialog_cancel, (DialogInterface.OnClickListener) null);
        return builder.create();
    }

    private void initView(View view) {
        this.lvPairedDevices = (ListView) view.findViewById(R.id.lv_dialog_choose_bluetooth_device_paired_devices);
        this.lvFoundDevices = (ListView) view.findViewById(R.id.lv_dialog_choose_bluetooth_device_found_devices);
        this.tvPairedDeviceEmpty = (TextView) view.findViewById(R.id.tv_dialog_choose_bluetooth_device_paired_devices_empty);
        this.tvFoundDeviceEmpty = (TextView) view.findViewById(R.id.tv_dialog_choose_bluetooth_device_found_devices_empty);
        this.tvSearchDevice = (TextView) view.findViewById(R.id.tv_dialog_choose_bluetooth_device_search_device);
        this.progressBar = (ProgressBar) view.findViewById(R.id.pb_dialog_choose_bluetooth_device_progress_bar);
        this.btn_hide = (Button) view.findViewById(R.id.btn_hide);
    }

    private void setListener() {
        this.tvSearchDevice.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.dialog.BluetoothDeviceChooseDialog.1
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                BluetoothDeviceChooseDialog.this.tvSearchDevice.setEnabled(false);
                BluetoothDeviceChooseDialog.this.progressBar.setVisibility(0);
                BluetoothDeviceChooseDialog.this.tvFoundDeviceEmpty.setVisibility(8);
                if (BluetoothDeviceChooseDialog.this.mSearchInited) {
                    BluetoothDeviceChooseDialog.this.foundDeviceList.clear();
                    BluetoothDeviceChooseDialog.this.foundDeviceAdapter.notifyDataSetChanged();
                } else {
                    BluetoothDeviceChooseDialog.this.foundDeviceList = new ArrayList();
                    BluetoothDeviceChooseDialog.this.foundDeviceAdapter = new BluetoothDevicePrinterAdapter(BluetoothDeviceChooseDialog.this.mContext, BluetoothDeviceChooseDialog.this.foundDeviceList);
                    BluetoothDeviceChooseDialog.this.lvFoundDevices.setAdapter((ListAdapter) BluetoothDeviceChooseDialog.this.foundDeviceAdapter);
                    BluetoothDeviceChooseDialog.this.mBluetoothReceiver = new BluetoothDeviceReceiver();
                    BluetoothDeviceChooseDialog.this.mBluetoothIntentFilter = new IntentFilter();
                    BluetoothDeviceChooseDialog.this.mBluetoothIntentFilter.addAction("android.bluetooth.device.action.FOUND");
                    BluetoothDeviceChooseDialog.this.mBluetoothIntentFilter.addAction("android.bluetooth.adapter.action.DISCOVERY_FINISHED");
                    BluetoothDeviceChooseDialog.this.mSearchInited = true;
                }
                BluetoothDeviceChooseDialog.this.mContext.registerReceiver(BluetoothDeviceChooseDialog.this.mBluetoothReceiver, BluetoothDeviceChooseDialog.this.mBluetoothIntentFilter);
                BluetoothDeviceChooseDialog.this.mRegistered = true;
                if (ActivityCompat.checkSelfPermission(BluetoothDeviceChooseDialog.this.mContext, "android.permission.BLUETOOTH_SCAN") == 0) {
                    BluetoothDeviceChooseDialog.this.mBluetoothAdapter.startDiscovery();
                }
            }
        });
        this.lvPairedDevices.setOnItemClickListener(new AdapterView.OnItemClickListener() { // from class: com.aipsoft.aipsoftconnect.dialog.BluetoothDeviceChooseDialog.2
            @Override // android.widget.AdapterView.OnItemClickListener
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                if (ActivityCompat.checkSelfPermission(BluetoothDeviceChooseDialog.this.mContext, "android.permission.BLUETOOTH_SCAN") == 0) {
                    BluetoothDeviceChooseDialog.this.mBluetoothAdapter.cancelDiscovery();
                    if (BluetoothDeviceChooseDialog.this.mRegistered) {
                        BluetoothDeviceChooseDialog.this.mContext.unregisterReceiver(BluetoothDeviceChooseDialog.this.mBluetoothReceiver);
                        BluetoothDeviceChooseDialog.this.mRegistered = false;
                    }
                    BluetoothDeviceChooseDialog.this.mListener.onDeviceItemClick((BluetoothDevice) parent.getAdapter().getItem(position));
                    BluetoothDeviceChooseDialog.this.getDialog().dismiss();
                }
            }
        });
        this.lvFoundDevices.setOnItemClickListener(new AdapterView.OnItemClickListener() { // from class: com.aipsoft.aipsoftconnect.dialog.BluetoothDeviceChooseDialog.3
            @Override // android.widget.AdapterView.OnItemClickListener
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                if (ActivityCompat.checkSelfPermission(BluetoothDeviceChooseDialog.this.mContext, "android.permission.BLUETOOTH_SCAN") == 0) {
                    BluetoothDeviceChooseDialog.this.mBluetoothAdapter.cancelDiscovery();
                    if (BluetoothDeviceChooseDialog.this.mRegistered) {
                        BluetoothDeviceChooseDialog.this.mContext.unregisterReceiver(BluetoothDeviceChooseDialog.this.mBluetoothReceiver);
                        BluetoothDeviceChooseDialog.this.mRegistered = false;
                    }
                    BluetoothDeviceChooseDialog.this.mListener.onDeviceItemClick((BluetoothDevice) parent.getAdapter().getItem(position));
                    BluetoothDeviceChooseDialog.this.getDialog().dismiss();
                }
            }
        });
        this.btn_hide.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.dialog.BluetoothDeviceChooseDialog.4
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                if (BluetoothDeviceChooseDialog.this.isHidePairedDevlist) {
                    BluetoothDeviceChooseDialog.this.isHidePairedDevlist = false;
                    BluetoothDeviceChooseDialog.this.lvPairedDevices.setVisibility(0);
                    BluetoothDeviceChooseDialog.this.btn_hide.setText("Hide_↑↑↑");
                } else {
                    BluetoothDeviceChooseDialog.this.isHidePairedDevlist = true;
                    BluetoothDeviceChooseDialog.this.lvPairedDevices.setVisibility(8);
                    BluetoothDeviceChooseDialog.this.btn_hide.setText("Show_↓↓↓");
                }
            }
        });
    }

    private void initData() {
        this.mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (ActivityCompat.checkSelfPermission(this.mContext, "android.permission.BLUETOOTH_CONNECT") != 0) {
            return;
        }
        ArrayList arrayList = new ArrayList(this.mBluetoothAdapter.getBondedDevices());
        this.pairedDeviceList = arrayList;
        if (arrayList.size() == 0) {
            this.tvPairedDeviceEmpty.setVisibility(0);
        }
        BluetoothDevicePrinterAdapter bluetoothDevicePrinterAdapter = new BluetoothDevicePrinterAdapter(this.mContext, this.pairedDeviceList);
        this.pairedDeviceAdapter = bluetoothDevicePrinterAdapter;
        this.lvPairedDevices.setAdapter((ListAdapter) bluetoothDevicePrinterAdapter);
    }

    @Override // android.app.DialogFragment, android.content.DialogInterface.OnDismissListener
    public void onDismiss(DialogInterface dialog) {
        super.onDismiss(dialog);
        if (ActivityCompat.checkSelfPermission(this.mContext, "android.permission.BLUETOOTH_SCAN") != 0) {
            return;
        }
        this.mBluetoothAdapter.cancelDiscovery();
        if (this.mRegistered) {
            this.mContext.unregisterReceiver(this.mBluetoothReceiver);
        }
    }

    public void setOnDeviceItemClickListener(onDeviceItemClickListener listener) {
        this.mListener = listener;
    }

    private class BluetoothDeviceReceiver extends BroadcastReceiver {
        private BluetoothDeviceReceiver() {
        }

        @Override // android.content.BroadcastReceiver
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if ("android.bluetooth.device.action.FOUND".equals(action)) {
                BluetoothDevice device = (BluetoothDevice) intent.getParcelableExtra("android.bluetooth.device.extra.DEVICE");
                if (!BluetoothDeviceChooseDialog.this.foundDeviceList.contains(device)) {
                    BluetoothDeviceChooseDialog.this.foundDeviceList.add(device);
                    BluetoothDeviceChooseDialog.this.foundDeviceAdapter.notifyDataSetChanged();
                    return;
                }
                return;
            }
            if ("android.bluetooth.adapter.action.DISCOVERY_FINISHED".equals(action) && ActivityCompat.checkSelfPermission(BluetoothDeviceChooseDialog.this.mContext, "android.permission.BLUETOOTH_SCAN") == 0) {
                BluetoothDeviceChooseDialog.this.mBluetoothAdapter.cancelDiscovery();
                BluetoothDeviceChooseDialog.this.mContext.unregisterReceiver(BluetoothDeviceChooseDialog.this.mBluetoothReceiver);
                BluetoothDeviceChooseDialog.this.mRegistered = false;
                BluetoothDeviceChooseDialog.this.tvSearchDevice.setEnabled(true);
                BluetoothDeviceChooseDialog.this.progressBar.setVisibility(8);
                if (BluetoothDeviceChooseDialog.this.foundDeviceList.size() == 0) {
                    BluetoothDeviceChooseDialog.this.tvFoundDeviceEmpty.setVisibility(0);
                }
            }
        }
    }
}
