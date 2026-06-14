package com.aipsoft.aipsoftconnect.view.imp;

import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.view.accessibility.AccessibilityEventCompat;
import com.aipsoft.aipsoftconnect.R;
import com.aipsoft.aipsoftconnect.Service.BaseApplication;
import com.aipsoft.aipsoftconnect.Service.PrintServices;
import com.aipsoft.aipsoftconnect.Service.TimeRecordUtils;
import com.aipsoft.aipsoftconnect.databinding.ActivityNetworkBinding;
import com.rt.printerlibrary.bean.WiFiConfigBean;
import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.factory.connect.PIFactory;
import com.rt.printerlibrary.factory.connect.WiFiFactory;
import com.rt.printerlibrary.observer.PrinterObserver;
import com.rt.printerlibrary.observer.PrinterObserverManager;
import com.rt.printerlibrary.printer.RTPrinter;
import java.io.UnsupportedEncodingException;

/* JADX INFO: loaded from: classes8.dex */
public class NetworkActivity extends AppCompatActivity implements PrinterObserver {
    ActivityNetworkBinding binding;
    ImageView close;
    private Object configObj;
    private Button connectButton;
    private PrinterInterface curPrinterInterface = null;
    private Button disConnectButton;
    LinearLayout headingLayout;
    EditText ip1;
    EditText ip2;
    EditText ip3;
    EditText ip4;
    private String orientation;
    EditText port;
    Button save;
    Button testprint;
    TextView title;
    private int wifiConnect;

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ActivityNetworkBinding activityNetworkBindingInflate = ActivityNetworkBinding.inflate(getLayoutInflater());
        this.binding = activityNetworkBindingInflate;
        setContentView(activityNetworkBindingInflate.getRoot());
        this.close = this.binding.close;
        this.title = this.binding.title;
        this.headingLayout = this.binding.headingLayout;
        this.ip1 = this.binding.ip1;
        this.ip2 = this.binding.ip2;
        this.ip3 = this.binding.ip3;
        this.ip4 = this.binding.ip4;
        this.port = this.binding.port;
        this.testprint = this.binding.testprint;
        this.save = this.binding.save;
        Window window = getWindow();
        window.clearFlags(AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL);
        window.addFlags(Integer.MIN_VALUE);
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.colorPrimary));
        View view1 = getWindow().getDecorView();
        if (Build.VERSION.SDK_INT >= 23) {
            view1.setSystemUiVisibility(view1.getSystemUiVisibility() & (-8193));
        }
        this.connectButton = (Button) findViewById(R.id.connectButton);
        this.disConnectButton = (Button) findViewById(R.id.disconnectButton);
        SharedPreferences prefs = getSharedPreferences("pref", 0);
        String string = prefs.getString("orientation", "Portrait");
        this.orientation = string;
        if (string.equals("Portrait")) {
            setRequestedOrientation(1);
        } else {
            setRequestedOrientation(0);
        }
        PrinterObserverManager.getInstance().add(this);
        if (!prefs.getString("network_device", "").equals("")) {
            String[] network_device = prefs.getString("network_device", "").split(":");
            String[] ip = network_device[0].split("\\.");
            String port_sp = network_device[1];
            this.ip1.setText(ip[0]);
            this.ip2.setText(ip[1]);
            this.ip3.setText(ip[2]);
            this.ip4.setText(ip[3]);
            this.port.setText(port_sp);
        }
        int i = prefs.getInt("wificonnected", 0);
        this.wifiConnect = i;
        if (i == 1) {
            this.connectButton.setEnabled(false);
            this.disConnectButton.setEnabled(true);
            this.testprint.setEnabled(true);
        }
        this.connectButton.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.NetworkActivity.1
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                NetworkActivity.this.setConnect();
            }
        });
        this.disConnectButton.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.NetworkActivity.2
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                NetworkActivity.this.doDisConnect();
            }
        });
        this.close.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.NetworkActivity.3
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                NetworkActivity.this.finish();
            }
        });
        this.testprint.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.NetworkActivity.4
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                try {
                    PrintServices.escPrint();
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            }
        });
        this.save.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.NetworkActivity.5
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                NetworkActivity.this.finish();
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void doDisConnect() {
        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
        if (rtPrinter != null && rtPrinter.getPrinterInterface() != null) {
            rtPrinter.disConnect();
            this.connectButton.setEnabled(true);
            this.disConnectButton.setEnabled(false);
            this.testprint.setEnabled(false);
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void setConnect() {
        if (!this.ip1.getText().toString().equals("") && !this.ip2.getText().toString().equals("") && !this.ip3.getText().toString().equals("") && !this.ip4.getText().toString().equals("") && !this.port.getText().toString().equals("")) {
            String ip = this.ip1.getText().toString() + "." + this.ip2.getText().toString() + "." + this.ip3.getText().toString() + "." + this.ip4.getText().toString();
            int port_no = Integer.parseInt(this.port.getText().toString());
            WiFiConfigBean wiFiConfigBean = new WiFiConfigBean(ip, port_no);
            this.configObj = wiFiConfigBean;
            WiFiConfigBean wiFiConfigBean2 = wiFiConfigBean;
            connectWifi(wiFiConfigBean2);
            this.connectButton.setEnabled(false);
            this.disConnectButton.setEnabled(true);
            this.testprint.setEnabled(true);
            SharedPreferences.Editor editor = getSharedPreferences("pref", 0).edit();
            editor.putString("network_device", ip + ":" + port_no);
            editor.putString("network_device_ip", ip);
            editor.putInt("network_device_port", port_no);
            editor.putInt("wificonnected", 1);
            editor.apply();
            return;
        }
        showToast("Enter all fields");
    }

    private void connectWifi(WiFiConfigBean wiFiConfigBean) {
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

    private void toast(final String e) {
        runOnUiThread(new Runnable() { // from class: com.aipsoft.aipsoftconnect.view.imp.NetworkActivity$$ExternalSyntheticLambda0
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.m66xbf1ff2d4(e);
            }
        });
    }

    /* JADX INFO: renamed from: lambda$toast$0$com-aipsoft-aipsoftconnect-view-imp-NetworkActivity, reason: not valid java name */
    /* synthetic */ void m66xbf1ff2d4(String e) {
        Toast.makeText(this, e, 0).show();
    }

    @Override // com.rt.printerlibrary.observer.PrinterObserver
    public void printerObserverCallback(final PrinterInterface printerInterface, final int state) {
        runOnUiThread(new Runnable() { // from class: com.aipsoft.aipsoftconnect.view.imp.NetworkActivity.6
            @Override // java.lang.Runnable
            public void run() {
                switch (state) {
                    case 0:
                        PrinterInterface printerInterface2 = printerInterface;
                        if (printerInterface2 != null && printerInterface2.getConfigObject() != null) {
                            NetworkActivity.this.showToast(printerInterface.getConfigObject().toString() + NetworkActivity.this.getString(R.string._main_disconnect));
                        } else {
                            NetworkActivity networkActivity = NetworkActivity.this;
                            networkActivity.showToast(networkActivity.getString(R.string._main_disconnect));
                        }
                        TimeRecordUtils.record("RT连接断开：", System.currentTimeMillis());
                        NetworkActivity.this.curPrinterInterface = null;
                        NetworkActivity.this.connectButton.setEnabled(true);
                        NetworkActivity.this.disConnectButton.setEnabled(false);
                        NetworkActivity.this.testprint.setEnabled(false);
                        break;
                    case 1:
                        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
                        TimeRecordUtils.record("RT连接end：", System.currentTimeMillis());
                        NetworkActivity.this.showToast(printerInterface.getConfigObject().toString() + NetworkActivity.this.getString(R.string._main_connected));
                        NetworkActivity.this.curPrinterInterface = printerInterface;
                        rtPrinter.setPrinterInterface(printerInterface);
                        NetworkActivity.this.connectButton.setEnabled(false);
                        NetworkActivity.this.disConnectButton.setEnabled(true);
                        NetworkActivity.this.testprint.setEnabled(true);
                        break;
                }
            }
        });
    }

    @Override // com.rt.printerlibrary.observer.PrinterObserver
    public void printerReadMsgCallback(PrinterInterface printerInterface, byte[] bytes) {
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void showToast(String s) {
        Toast.makeText(this, s, 0).show();
    }
}
