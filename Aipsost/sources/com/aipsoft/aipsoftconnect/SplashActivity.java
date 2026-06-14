package com.aipsoft.aipsoftconnect;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.FragmentActivity;
import com.bumptech.glide.Glide;

/* JADX INFO: loaded from: classes8.dex */
public class SplashActivity extends AppCompatActivity {
    private ImageView gifImage;
    private ImageView logoImage;

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        this.gifImage = (ImageView) findViewById(R.id.gifImage);
        this.logoImage = (ImageView) findViewById(R.id.logoImage);
        Glide.with((FragmentActivity) this).load(Integer.valueOf(R.drawable.gif_image)).into(this.gifImage);
        Glide.with((FragmentActivity) this).load(Integer.valueOf(R.drawable.laundry_logo)).into(this.logoImage);
        Handler handler = new Handler();
        handler.postDelayed(new Runnable() { // from class: com.aipsoft.aipsoftconnect.SplashActivity.1
            @Override // java.lang.Runnable
            public void run() {
                Intent intent = new Intent(SplashActivity.this, (Class<?>) MainActivity.class);
                intent.setFlags(268468224);
                SplashActivity.this.startActivity(intent);
            }
        }, 4000L);
    }
}
