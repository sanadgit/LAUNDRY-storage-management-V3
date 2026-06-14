package com.aipsoft.aipsoftconnect;

import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import androidx.appcompat.app.AppCompatActivity;
import com.journeyapps.barcodescanner.BarcodeView;
import com.journeyapps.barcodescanner.CaptureManager;
import com.journeyapps.barcodescanner.DecoratedBarcodeView;
import com.journeyapps.barcodescanner.Size;
import com.journeyapps.barcodescanner.ViewfinderView;

/* JADX INFO: loaded from: classes8.dex */
public class ScanActivity extends AppCompatActivity {
    private DecoratedBarcodeView barcodeScannerView;
    private BarcodeView barcodeView;
    private CaptureManager capture;
    private LinearLayout closeButton;
    private View view;
    private ViewfinderView viewfinderView;

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_scan);
        getSupportActionBar().hide();
        this.barcodeScannerView = (DecoratedBarcodeView) findViewById(R.id.zxing_barcode_scanner);
        this.viewfinderView = (ViewfinderView) findViewById(R.id.zxing_viewfinder_view);
        this.barcodeView = (BarcodeView) findViewById(R.id.zxing_barcode_surface);
        this.closeButton = (LinearLayout) findViewById(R.id.closeButton);
        this.view = findViewById(R.id.view);
        int width1 = (int) (((double) getResources().getDisplayMetrics().widthPixels) * 0.7d);
        int height1 = (int) (((double) getResources().getDisplayMetrics().heightPixels) * 0.4d);
        int width2 = (int) (((double) getResources().getDisplayMetrics().widthPixels) * 0.7d);
        int height2 = (int) (((double) getResources().getDisplayMetrics().heightPixels) * 0.4d);
        this.barcodeView.setFramingRectSize(new Size(width1, height1));
        ViewGroup.LayoutParams params = this.view.getLayoutParams();
        params.width = dpToPx(12) + width2;
        params.height = dpToPx(12) + height2;
        this.view.setLayoutParams(params);
        CaptureManager captureManager = new CaptureManager(this, this.barcodeScannerView);
        this.capture = captureManager;
        captureManager.initializeFromIntent(getIntent(), savedInstanceState);
        this.capture.decode();
        this.closeButton.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.ScanActivity.1
            @Override // android.view.View.OnClickListener
            public void onClick(View v) {
                ScanActivity.this.finish();
            }
        });
        changeLaserVisibility(false);
    }

    public void changeLaserVisibility(boolean visible) {
    }

    public int dpToPx(int dp) {
        DisplayMetrics displayMetrics = getApplicationContext().getResources().getDisplayMetrics();
        return Math.round(dp * (displayMetrics.xdpi / 160.0f));
    }

    @Override // androidx.fragment.app.FragmentActivity, android.app.Activity
    protected void onResume() {
        super.onResume();
        this.capture.onResume();
    }

    @Override // androidx.fragment.app.FragmentActivity, android.app.Activity
    protected void onPause() {
        super.onPause();
        this.capture.onPause();
    }

    @Override // androidx.appcompat.app.AppCompatActivity, androidx.fragment.app.FragmentActivity, android.app.Activity
    protected void onDestroy() {
        super.onDestroy();
        this.capture.onDestroy();
    }

    @Override // androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        this.capture.onSaveInstanceState(outState);
    }

    @Override // androidx.appcompat.app.AppCompatActivity, android.app.Activity, android.view.KeyEvent.Callback
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        return this.barcodeScannerView.onKeyDown(keyCode, event) || super.onKeyDown(keyCode, event);
    }
}
