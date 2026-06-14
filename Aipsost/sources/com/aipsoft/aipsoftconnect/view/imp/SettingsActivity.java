package com.aipsoft.aipsoftconnect.view.imp;

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
import com.aipsoft.aipsoftconnect.databinding.ActivitySettingsBinding;

/* JADX INFO: loaded from: classes8.dex */
public class SettingsActivity extends AppCompatActivity {
    ActivitySettingsBinding binding;
    ImageView close;
    private RadioButton default_screen;
    private RadioButton disable;
    private RadioButton enable;
    private RadioGroup fullScreenGroup;
    private RadioButton full_screen;
    LinearLayout headingLayout;
    private String keyboardStatus;
    private RadioButton landscape;
    private String orientation;
    private RadioButton portrait;
    LinearLayout printSettings;
    private RadioButton radioButton;
    private RadioGroup radioGroup;
    private RadioGroup radioScreenGroup;
    private String screen;
    private SharedPreferences sp;
    TextView title;

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ActivitySettingsBinding activitySettingsBindingInflate = ActivitySettingsBinding.inflate(getLayoutInflater());
        this.binding = activitySettingsBindingInflate;
        setContentView(activitySettingsBindingInflate.getRoot());
        this.close = this.binding.close;
        this.title = this.binding.title;
        this.headingLayout = this.binding.headingLayout;
        this.printSettings = this.binding.printSettings;
        Window window = getWindow();
        window.clearFlags(AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL);
        window.addFlags(Integer.MIN_VALUE);
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.colorPrimary));
        View view1 = getWindow().getDecorView();
        if (Build.VERSION.SDK_INT >= 23) {
            view1.setSystemUiVisibility(view1.getSystemUiVisibility() & (-8193));
        }
        this.radioGroup = (RadioGroup) findViewById(R.id.radioGroup);
        this.enable = (RadioButton) findViewById(R.id.enable);
        this.disable = (RadioButton) findViewById(R.id.disable);
        this.radioScreenGroup = (RadioGroup) findViewById(R.id.radioScreenGroup);
        this.portrait = (RadioButton) findViewById(R.id.portrait);
        this.landscape = (RadioButton) findViewById(R.id.landscape);
        this.fullScreenGroup = (RadioGroup) findViewById(R.id.fullScreenGroup);
        this.full_screen = (RadioButton) findViewById(R.id.full_screen);
        this.default_screen = (RadioButton) findViewById(R.id.default_screen);
        SharedPreferences sharedPreferences = getSharedPreferences("pref", 0);
        this.sp = sharedPreferences;
        final SharedPreferences.Editor editor = sharedPreferences.edit();
        this.keyboardStatus = this.sp.getString("keyboard", "Enable");
        this.orientation = this.sp.getString("orientation", "Portrait");
        this.screen = this.sp.getString("screen", "default");
        if (this.orientation.equals("Portrait")) {
            setRequestedOrientation(1);
            this.portrait.setChecked(true);
        } else {
            setRequestedOrientation(0);
            this.landscape.setChecked(true);
        }
        if (this.screen.equals("full")) {
            View decorView = getWindow().getDecorView();
            decorView.setSystemUiVisibility(4102);
            this.full_screen.setChecked(true);
        } else {
            View decorView2 = getWindow().getDecorView();
            decorView2.setSystemUiVisibility(0);
            this.default_screen.setChecked(true);
        }
        if (this.keyboardStatus.equals("Disable")) {
            this.disable.setChecked(true);
        } else {
            this.enable.setChecked(true);
        }
        this.radioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.SettingsActivity.1
            @Override // android.widget.RadioGroup.OnCheckedChangeListener
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                RadioButton checkedRadioButton = (RadioButton) group.findViewById(checkedId);
                boolean isChecked = checkedRadioButton.isChecked();
                if (isChecked) {
                    editor.putString("keyboard", checkedRadioButton.getText().toString());
                    editor.apply();
                }
            }
        });
        this.radioScreenGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.SettingsActivity.2
            @Override // android.widget.RadioGroup.OnCheckedChangeListener
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                RadioButton checkedRadioButton = (RadioButton) group.findViewById(checkedId);
                checkedRadioButton.isChecked();
                if (checkedRadioButton.getText().toString().equals("Portrait")) {
                    SettingsActivity.this.setRequestedOrientation(1);
                    editor.putString("orientation", checkedRadioButton.getText().toString());
                    editor.apply();
                } else {
                    SettingsActivity.this.setRequestedOrientation(0);
                    editor.putString("orientation", checkedRadioButton.getText().toString());
                    editor.apply();
                }
            }
        });
        this.fullScreenGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.SettingsActivity.3
            @Override // android.widget.RadioGroup.OnCheckedChangeListener
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                RadioButton checkedRadioButton = (RadioButton) group.findViewById(checkedId);
                checkedRadioButton.isChecked();
                if (checkedRadioButton.getText().toString().equals("Full Screen")) {
                    View decorView3 = SettingsActivity.this.getWindow().getDecorView();
                    decorView3.setSystemUiVisibility(4102);
                    SettingsActivity.this.full_screen.setChecked(true);
                    editor.putString("screen", "full");
                    editor.apply();
                    return;
                }
                View decorView4 = SettingsActivity.this.getWindow().getDecorView();
                decorView4.setSystemUiVisibility(0);
                SettingsActivity.this.default_screen.setChecked(true);
                editor.putString("screen", "default");
                editor.apply();
            }
        });
        this.close.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.SettingsActivity.4
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                Intent resultIntent = new Intent();
                SettingsActivity.this.setResult(-1, resultIntent);
                SettingsActivity.this.finish();
            }
        });
        this.printSettings.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.SettingsActivity.5
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
            }
        });
        this.printSettings.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.view.imp.SettingsActivity.6
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                Intent intent = new Intent(SettingsActivity.this.getApplicationContext(), (Class<?>) PrintSettingsActivity.class);
                SettingsActivity.this.startActivity(intent);
            }
        });
    }

    @Override // androidx.activity.ComponentActivity, android.app.Activity
    public void onBackPressed() {
        super.onBackPressed();
        Intent resultIntent = new Intent();
        setResult(-1, resultIntent);
        finish();
    }
}
