package com.aipsoft.aipsoftconnect.view.imp;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.view.accessibility.AccessibilityEventCompat;
import com.aipsoft.aipsoftconnect.R;
import com.aipsoft.aipsoftconnect.databinding.ActivityPrinterSettingsBinding;

/* JADX INFO: loaded from: classes8.dex */
public class PrinterSettingsActivity extends AppCompatActivity {
    ImageView back;
    ActivityPrinterSettingsBinding binding;
    TextView bluetoothDetails;
    LinearLayout bluetoothPrinter;
    String bluetooth_device;
    LinearLayout headingLayout;
    TextView networkDetails;
    LinearLayout networkPrinter;
    String network_device;
    private String orientation;
    private int printerStatus;
    TextView title;
    TextView title1;

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ActivityPrinterSettingsBinding activityPrinterSettingsBindingInflate = ActivityPrinterSettingsBinding.inflate(getLayoutInflater());
        this.binding = activityPrinterSettingsBindingInflate;
        setContentView(activityPrinterSettingsBindingInflate.getRoot());
        this.back = this.binding.back;
        this.title = this.binding.title;
        this.headingLayout = this.binding.headingLayout;
        this.title1 = this.binding.title1;
        this.bluetoothDetails = this.binding.bluetoothDetails;
        this.bluetoothPrinter = this.binding.bluetoothPrinter;
        this.networkDetails = this.binding.networkDetails;
        this.networkPrinter = this.binding.networkPrinter;
        Window window = getWindow();
        window.clearFlags(AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL);
        window.addFlags(Integer.MIN_VALUE);
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.colorPrimary));
        View view1 = getWindow().getDecorView();
        if (Build.VERSION.SDK_INT >= 23) {
            view1.setSystemUiVisibility(view1.getSystemUiVisibility() & (-8193));
        }
        SharedPreferences prefs = getSharedPreferences("pref", 0);
        this.bluetooth_device = prefs.getString("bluetooth_device", "");
        this.network_device = prefs.getString("network_device", "");
        this.printerStatus = prefs.getInt("printerStatus", 0);
        String string = prefs.getString("orientation", "Portrait");
        this.orientation = string;
        if (string.equals("Portrait")) {
            setRequestedOrientation(1);
        } else {
            setRequestedOrientation(0);
        }
        int i = this.printerStatus;
        if (i == 1) {
            this.bluetoothPrinter.setVisibility(0);
            this.networkPrinter.setVisibility(8);
        } else if (i == 2) {
            this.bluetoothPrinter.setVisibility(8);
            this.networkPrinter.setVisibility(0);
        }
        if (!this.bluetoothPrinter.equals("")) {
            this.bluetoothDetails.setHint(this.bluetooth_device);
        }
        if (!this.network_device.equals("")) {
            this.networkDetails.setHint(this.network_device);
        }
        SharedPreferences prefs2 = getSharedPreferences("pref", 0);
        prefs2.getString("printer_select", "");
        this.bluetoothPrinter.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.PrinterSettingsActivity.1
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                Intent intent = new Intent(PrinterSettingsActivity.this, (Class<?>) BluetoothPrinterActivity.class);
                PrinterSettingsActivity.this.startActivity(intent);
                SharedPreferences.Editor editor = PrinterSettingsActivity.this.getSharedPreferences("pref", 0).edit();
                editor.putString("printer_select", "Bluetooth");
                editor.apply();
            }
        });
        this.networkPrinter.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.PrinterSettingsActivity.2
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                Intent intent = new Intent(PrinterSettingsActivity.this, (Class<?>) NetworkActivity.class);
                PrinterSettingsActivity.this.startActivity(intent);
                SharedPreferences.Editor editor = PrinterSettingsActivity.this.getSharedPreferences("pref", 0).edit();
                editor.putString("printer_select", "Network");
                editor.apply();
            }
        });
        this.back.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.PrinterSettingsActivity.3
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                PrinterSettingsActivity.this.onBackPressed();
            }
        });
    }

    @Override // androidx.fragment.app.FragmentActivity, android.app.Activity
    protected void onResume() {
        SharedPreferences prefs = getSharedPreferences("pref", 0);
        this.bluetooth_device = prefs.getString("bluetooth_device", "");
        this.network_device = prefs.getString("network_device", "");
        if (!this.bluetoothPrinter.equals("")) {
            this.bluetoothDetails.setHint(this.bluetooth_device);
        }
        if (!this.network_device.equals("")) {
            this.networkDetails.setHint(this.network_device);
        }
        super.onResume();
    }
}
