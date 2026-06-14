package com.aipsoft.aipsoftconnect.view.imp;

import android.app.Dialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.view.accessibility.AccessibilityEventCompat;
import com.aipsoft.aipsoftconnect.R;
import com.aipsoft.aipsoftconnect.Service.BaseApplication;
import com.aipsoft.aipsoftconnect.Service.Services;
import com.aipsoft.aipsoftconnect.databinding.ActivityPrintSettingsBinding;
import com.rt.printerlibrary.bean.BluetoothEdrConfigBean;
import com.rt.printerlibrary.bean.WiFiConfigBean;
import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.factory.connect.BluetoothFactory;
import com.rt.printerlibrary.factory.connect.PIFactory;
import com.rt.printerlibrary.factory.connect.WiFiFactory;
import com.rt.printerlibrary.printer.RTPrinter;

/* JADX INFO: loaded from: classes8.dex */
public class PrintSettingsActivity extends AppCompatActivity {
    LinearLayout arrow;
    private ImageView backButton;
    ActivityPrintSettingsBinding binding;
    private String bluetooth_device;
    private Object configObj;
    LinearLayout headingLayout;
    private String network_device;
    private String orientation;
    private String paired_device;
    LinearLayout printer;
    private int printerStatus;
    LinearLayout printerType;
    LinearLayout printerarrow;
    TextView printername;
    TextView printertype;
    private SharedPreferences sp;
    TextView title;
    private String wifi_device_ip;
    private int wifi_device_port;
    int radio_id = 0;
    private RTPrinter rtPrinter = null;
    private int status = 0;

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ActivityPrintSettingsBinding activityPrintSettingsBindingInflate = ActivityPrintSettingsBinding.inflate(getLayoutInflater());
        this.binding = activityPrintSettingsBindingInflate;
        setContentView(activityPrintSettingsBindingInflate.getRoot());
        this.title = this.binding.title;
        this.headingLayout = this.binding.headingLayout;
        this.printertype = this.binding.printertype;
        this.printerarrow = this.binding.printerarrow;
        this.printerType = this.binding.printerType;
        this.printername = this.binding.printername;
        this.arrow = this.binding.arrow;
        this.printer = this.binding.printer;
        Window window = getWindow();
        window.clearFlags(AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL);
        window.addFlags(Integer.MIN_VALUE);
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.colorPrimary));
        View view1 = getWindow().getDecorView();
        if (Build.VERSION.SDK_INT >= 23) {
            view1.setSystemUiVisibility(view1.getSystemUiVisibility() & (-8193));
        }
        this.backButton = (ImageView) findViewById(R.id.backButton);
        this.sp = getSp();
        final SharedPreferences prefs = getSharedPreferences("pref", 0);
        String string = this.sp.getString("orientation", "Portrait");
        this.orientation = string;
        if (string.equals("Portrait")) {
            setRequestedOrientation(1);
        } else {
            setRequestedOrientation(0);
        }
        this.printer.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.PrintSettingsActivity.1
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                Intent intent = new Intent(PrintSettingsActivity.this, (Class<?>) PrinterSettingsActivity.class);
                PrintSettingsActivity.this.startActivity(intent);
            }
        });
        final Dialog dialog = new Dialog(this);
        dialog.setContentView(R.layout.printer_dialog);
        dialog.getWindow().setLayout(Services.getSize(this), -2);
        final LinearLayout back = (LinearLayout) dialog.findViewById(R.id.backButton);
        final RadioGroup printer_radio = (RadioGroup) dialog.findViewById(R.id.printer_radio);
        final RadioButton bluetooth = (RadioButton) dialog.findViewById(R.id.bluetooth);
        final RadioButton wifi = (RadioButton) dialog.findViewById(R.id.wifi);
        this.printerStatus = prefs.getInt("printerStatus", 1);
        SharedPreferences.Editor editor = getSharedPreferences("pref", 0).edit();
        this.network_device = prefs.getString("network_device", "");
        this.bluetooth_device = prefs.getString("bluetooth_device", "");
        if (this.printerStatus == 1) {
            bluetooth.setChecked(true);
            editor.putInt("printerStatus", 1);
            editor.apply();
            this.printertype.setHint("Bluetooth printer");
            this.printername.setText(this.bluetooth_device);
        } else {
            wifi.setChecked(true);
            editor.putInt("printerStatus", 2);
            editor.apply();
            this.printertype.setHint("Network printer");
            this.printername.setText(this.network_device);
        }
        this.printerType.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.PrintSettingsActivity.2
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                if (PrintSettingsActivity.this.radio_id != 0) {
                    RadioButton r = (RadioButton) dialog.findViewById(PrintSettingsActivity.this.radio_id);
                    r.setChecked(true);
                }
                PrintSettingsActivity.this.paired_device = prefs.getString("bluetooth_device", "");
                if (!PrintSettingsActivity.this.paired_device.isEmpty() && !wifi.isChecked()) {
                    bluetooth.setChecked(true);
                }
                printer_radio.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.PrintSettingsActivity.2.1
                    @Override // android.widget.RadioGroup.OnCheckedChangeListener
                    public void onCheckedChanged(RadioGroup radioGroup, int i) {
                        SharedPreferences.Editor editor2 = PrintSettingsActivity.this.getSharedPreferences("pref", 0).edit();
                        PrintSettingsActivity.this.radio_id = radioGroup.getCheckedRadioButtonId();
                        RadioButton radioButton = (RadioButton) dialog.findViewById(radioGroup.getCheckedRadioButtonId());
                        if (radioButton.getText().toString().equals("Bluetooth printer")) {
                            PrintSettingsActivity.this.printername.setText(PrintSettingsActivity.this.bluetooth_device);
                            editor2.putInt("printerStatus", 1);
                            editor2.apply();
                            if (!PrintSettingsActivity.this.paired_device.isEmpty()) {
                                BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
                                String[] array = PrintSettingsActivity.this.paired_device.split(", ");
                                String address = array[1];
                                BluetoothDevice mDevice = mBluetoothAdapter.getRemoteDevice(address);
                                PrintSettingsActivity.this.configObj = new BluetoothEdrConfigBean(mDevice);
                                BluetoothEdrConfigBean bluetoothEdrConfigBean = (BluetoothEdrConfigBean) PrintSettingsActivity.this.configObj;
                                PrintSettingsActivity.this.connectBluetooth(bluetoothEdrConfigBean);
                            }
                        } else {
                            PrintSettingsActivity.this.printername.setText(PrintSettingsActivity.this.network_device);
                            editor2.putInt("printerStatus", 2);
                            editor2.apply();
                            PrintSettingsActivity.this.doDisConnect();
                            PrintSettingsActivity.this.wifi_device_ip = prefs.getString("network_device_ip", "");
                            PrintSettingsActivity.this.wifi_device_port = prefs.getInt("network_device_port", 0);
                            if (!PrintSettingsActivity.this.wifi_device_ip.equals("") && PrintSettingsActivity.this.wifi_device_port != 0) {
                                PrintSettingsActivity.this.configObj = new WiFiConfigBean(PrintSettingsActivity.this.wifi_device_ip, PrintSettingsActivity.this.wifi_device_port);
                                WiFiConfigBean wiFiConfigBean = (WiFiConfigBean) PrintSettingsActivity.this.configObj;
                                PrintSettingsActivity.this.connectWifi(wiFiConfigBean);
                            }
                        }
                        PrintSettingsActivity.this.printertype.setHint(radioButton.getText().toString().replaceAll(" Printer", ""));
                        dialog.cancel();
                    }
                });
                back.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.PrintSettingsActivity.2.2
                    @Override // android.view.View.OnClickListener
                    public void onClick(View view2) {
                        dialog.cancel();
                    }
                });
                dialog.show();
            }
        });
        this.backButton.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.PrintSettingsActivity.3
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                PrintSettingsActivity.this.onBackPressed();
            }
        });
    }

    public SharedPreferences getSp() {
        return Services.getSP(this);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void connectBluetooth(BluetoothEdrConfigBean bluetoothEdrConfigBean) {
        this.rtPrinter = BaseApplication.getInstance().getRtPrinter();
        PIFactory piFactory = new BluetoothFactory();
        PrinterInterface printerInterface = piFactory.create();
        printerInterface.setConfigObject(bluetoothEdrConfigBean);
        this.rtPrinter.setPrinterInterface(printerInterface);
        try {
            this.rtPrinter.connect(bluetoothEdrConfigBean);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void connectWifi(WiFiConfigBean wiFiConfigBean) {
        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
        PIFactory piFactory = new WiFiFactory();
        PrinterInterface printerInterface = piFactory.create();
        printerInterface.setConfigObject(wiFiConfigBean);
        rtPrinter.setPrinterInterface(printerInterface);
        try {
            rtPrinter.connect(wiFiConfigBean);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void doDisConnect() {
        RTPrinter rTPrinter;
        this.rtPrinter = BaseApplication.getInstance().getRtPrinter();
        if (!this.paired_device.isEmpty() && (rTPrinter = this.rtPrinter) != null && rTPrinter.getPrinterInterface() != null) {
            this.rtPrinter.disConnect();
        }
    }
}
