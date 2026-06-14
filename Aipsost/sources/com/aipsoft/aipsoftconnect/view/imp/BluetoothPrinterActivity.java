package com.aipsoft.aipsoftconnect.view.imp;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.view.accessibility.AccessibilityEventCompat;
import androidx.recyclerview.widget.ItemTouchHelper;
import com.aipsoft.aipsoftconnect.R;
import com.aipsoft.aipsoftconnect.Service.BaseApplication;
import com.aipsoft.aipsoftconnect.Service.PrintServices;
import com.aipsoft.aipsoftconnect.Service.TimeRecordUtils;
import com.aipsoft.aipsoftconnect.dialog.BluetoothDeviceChooseDialog;
import com.rt.printerlibrary.bean.BluetoothEdrConfigBean;
import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.factory.connect.BluetoothFactory;
import com.rt.printerlibrary.factory.connect.PIFactory;
import com.rt.printerlibrary.observer.PrinterObserver;
import com.rt.printerlibrary.observer.PrinterObserverManager;
import com.rt.printerlibrary.printer.RTPrinter;
import java.io.UnsupportedEncodingException;

/* JADX INFO: loaded from: classes8.dex */
public class BluetoothPrinterActivity extends AppCompatActivity implements PrinterObserver {
    private ImageView back;
    private int bluetoothConnected;
    private Button close;
    private Object configObj;
    private Button connectButton;
    private LinearLayout connectDevice;
    private TextView deviceName;
    private Button disConnectButton;
    private String orientation;
    private String paired_device;
    private Button testPrint;
    int REQUEST_ENABLE_BT = ItemTouchHelper.Callback.DEFAULT_DRAG_ANIMATION_DURATION;
    private PrinterInterface curPrinterInterface = null;

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bluetooth_printer);
        Window window = getWindow();
        window.clearFlags(AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL);
        window.addFlags(Integer.MIN_VALUE);
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.colorPrimary));
        View view1 = getWindow().getDecorView();
        if (Build.VERSION.SDK_INT >= 23) {
            view1.setSystemUiVisibility(view1.getSystemUiVisibility() & (-8193));
        }
        PrinterObserverManager.getInstance().add(this);
        Intent enableBtIntent = new Intent("android.bluetooth.adapter.action.REQUEST_ENABLE");
        if (ActivityCompat.checkSelfPermission(this, "android.permission.BLUETOOTH_CONNECT") != 0) {
            return;
        }
        startActivityForResult(enableBtIntent, this.REQUEST_ENABLE_BT);
        this.connectDevice = (LinearLayout) findViewById(R.id.connectDevice);
        this.connectButton = (Button) findViewById(R.id.connectButton);
        this.disConnectButton = (Button) findViewById(R.id.disconnectButton);
        this.back = (ImageView) findViewById(R.id.back);
        this.testPrint = (Button) findViewById(R.id.testprint);
        this.close = (Button) findViewById(R.id.close);
        this.deviceName = (TextView) findViewById(R.id.deviceName);
        SharedPreferences prefs = getSharedPreferences("pref", 0);
        this.paired_device = prefs.getString("bluetooth_device", "");
        this.bluetoothConnected = prefs.getInt("bluetoothConnected", 0);
        String string = prefs.getString("orientation", "Portrait");
        this.orientation = string;
        if (string.equals("Portrait")) {
            setRequestedOrientation(1);
        } else {
            setRequestedOrientation(0);
        }
        if (this.bluetoothConnected == 1) {
            this.connectButton.setEnabled(false);
            this.disConnectButton.setEnabled(true);
            this.testPrint.setEnabled(true);
            if (!this.paired_device.equals("")) {
                this.deviceName.setText(this.paired_device);
            }
        }
        this.connectButton.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.BluetoothPrinterActivity.1
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                BluetoothPrinterActivity.this.setConnect();
            }
        });
        this.disConnectButton.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.BluetoothPrinterActivity.2
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                BluetoothPrinterActivity.this.doDisConnect();
            }
        });
        this.connectDevice.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.BluetoothPrinterActivity.3
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                Intent enableBtIntent2 = new Intent("android.bluetooth.adapter.action.REQUEST_ENABLE");
                if (ActivityCompat.checkSelfPermission(v.getContext(), "android.permission.BLUETOOTH_CONNECT") != 0) {
                    return;
                }
                BluetoothPrinterActivity bluetoothPrinterActivity = BluetoothPrinterActivity.this;
                bluetoothPrinterActivity.startActivityForResult(enableBtIntent2, bluetoothPrinterActivity.REQUEST_ENABLE_BT);
                BluetoothPrinterActivity.this.showBluetoothDeviceChooseDialog(v.getContext());
            }
        });
        this.back.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.BluetoothPrinterActivity.4
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                BluetoothPrinterActivity.this.finish();
            }
        });
        this.close.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.BluetoothPrinterActivity.5
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                BluetoothPrinterActivity.this.finish();
            }
        });
        this.testPrint.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.BluetoothPrinterActivity.6
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                try {
                    PrintServices.escPrint();
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void showBluetoothDeviceChooseDialog(final Context context) {
        BluetoothDeviceChooseDialog bluetoothDeviceChooseDialog = new BluetoothDeviceChooseDialog();
        bluetoothDeviceChooseDialog.setOnDeviceItemClickListener(new BluetoothDeviceChooseDialog.onDeviceItemClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.BluetoothPrinterActivity.7
            @Override // com.aipsoft.aipsoftconnect.dialog.BluetoothDeviceChooseDialog.onDeviceItemClickListener
            public void onDeviceItemClick(BluetoothDevice device) {
                if (ActivityCompat.checkSelfPermission(context, "android.permission.BLUETOOTH_CONNECT") != 0) {
                    return;
                }
                if (TextUtils.isEmpty(device.getName())) {
                    BluetoothPrinterActivity.this.deviceName.setText(device.getAddress());
                    BluetoothPrinterActivity.this.paired_device = device.getName() + ", " + device.getAddress();
                } else {
                    BluetoothPrinterActivity.this.deviceName.setText(device.getName() + " [" + device.getAddress() + "]");
                    BluetoothPrinterActivity.this.paired_device = device.getName() + ", " + device.getAddress();
                }
                BluetoothPrinterActivity.this.configObj = new BluetoothEdrConfigBean(device);
            }
        });
        bluetoothDeviceChooseDialog.show(getFragmentManager(), (String) null);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void setConnect() {
        if (!this.deviceName.getText().equals("Click to connect a device")) {
            if (this.paired_device.isEmpty()) {
                TimeRecordUtils.record("RT连接start：", System.currentTimeMillis());
                BluetoothEdrConfigBean bluetoothEdrConfigBean = (BluetoothEdrConfigBean) this.configObj;
                connectBluetooth(bluetoothEdrConfigBean);
                return;
            }
            BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
            String[] array = this.paired_device.split(", ");
            String address = array[1];
            BluetoothDevice mDevice = mBluetoothAdapter.getRemoteDevice(address);
            BluetoothEdrConfigBean bluetoothEdrConfigBean2 = new BluetoothEdrConfigBean(mDevice);
            this.configObj = bluetoothEdrConfigBean2;
            BluetoothEdrConfigBean bluetoothEdrConfigBean3 = bluetoothEdrConfigBean2;
            connectBluetooth(bluetoothEdrConfigBean3);
            return;
        }
        showToast("Device not found");
    }

    private void connectBluetooth(BluetoothEdrConfigBean bluetoothEdrConfigBean) {
        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
        PIFactory piFactory = new BluetoothFactory();
        PrinterInterface printerInterface = piFactory.create();
        printerInterface.setConfigObject(bluetoothEdrConfigBean);
        rtPrinter.setPrinterInterface(printerInterface);
        try {
            rtPrinter.connect(bluetoothEdrConfigBean);
            SharedPreferences.Editor editor = getSharedPreferences("pref", 0).edit();
            editor.putInt("bluetoothConnected", 1);
            editor.apply();
        } catch (Exception e) {
            e.printStackTrace();
        }
        this.connectButton.setEnabled(false);
        this.disConnectButton.setEnabled(true);
        this.testPrint.setEnabled(true);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void doDisConnect() {
        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
        if (rtPrinter != null && rtPrinter.getPrinterInterface() != null) {
            rtPrinter.disConnect();
        }
        this.connectButton.setEnabled(true);
        this.disConnectButton.setEnabled(false);
        this.testPrint.setEnabled(false);
    }

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, android.app.Activity
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        switch (requestCode) {
            case 100:
                if (grantResults.length > 0) {
                    int i = grantResults[0];
                }
                break;
            default:
                super.onRequestPermissionsResult(requestCode, permissions, grantResults);
                break;
        }
    }

    @Override // com.rt.printerlibrary.observer.PrinterObserver
    public void printerObserverCallback(final PrinterInterface printerInterface, final int state) {
        runOnUiThread(new Runnable() { // from class: com.aipsoft.aipsoftconnect.view.imp.BluetoothPrinterActivity.8
            @Override // java.lang.Runnable
            public void run() {
                switch (state) {
                    case 0:
                        PrinterInterface printerInterface2 = printerInterface;
                        if (printerInterface2 != null && printerInterface2.getConfigObject() != null) {
                            BluetoothPrinterActivity.this.showToast(printerInterface.getConfigObject().toString() + BluetoothPrinterActivity.this.getString(R.string._main_disconnect));
                        } else {
                            BluetoothPrinterActivity bluetoothPrinterActivity = BluetoothPrinterActivity.this;
                            bluetoothPrinterActivity.showToast(bluetoothPrinterActivity.getString(R.string._main_disconnect));
                        }
                        TimeRecordUtils.record("RT连接断开：", System.currentTimeMillis());
                        BluetoothPrinterActivity.this.curPrinterInterface = null;
                        BluetoothPrinterActivity.this.connectButton.setEnabled(true);
                        BluetoothPrinterActivity.this.disConnectButton.setEnabled(false);
                        BluetoothPrinterActivity.this.testPrint.setEnabled(false);
                        break;
                    case 1:
                        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
                        TimeRecordUtils.record("RT连接end：", System.currentTimeMillis());
                        BluetoothPrinterActivity.this.showToast(printerInterface.getConfigObject().toString() + BluetoothPrinterActivity.this.getString(R.string._main_connected));
                        BluetoothPrinterActivity.this.curPrinterInterface = printerInterface;
                        rtPrinter.setPrinterInterface(printerInterface);
                        if (!BluetoothPrinterActivity.this.paired_device.equals("")) {
                            SharedPreferences.Editor editor = BluetoothPrinterActivity.this.getSharedPreferences("pref", 0).edit();
                            editor.putString("bluetooth_device", BluetoothPrinterActivity.this.paired_device);
                            editor.apply();
                        }
                        BluetoothPrinterActivity.this.connectButton.setEnabled(false);
                        BluetoothPrinterActivity.this.disConnectButton.setEnabled(true);
                        BluetoothPrinterActivity.this.testPrint.setEnabled(true);
                        break;
                }
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void showToast(String s) {
        Toast.makeText(this, s, 0).show();
    }

    @Override // com.rt.printerlibrary.observer.PrinterObserver
    public void printerReadMsgCallback(PrinterInterface printerInterface, byte[] bytes) {
    }
}
