package com.aipsoft.aipsoftconnect;

import android.location.Location;
import android.webkit.WebView;
import androidx.constraintlayout.widget.ConstraintLayout;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationResult;
import kotlin.Metadata;
import kotlin.jvm.internal.Intrinsics;

/* JADX INFO: compiled from: MainActivity.kt */
/* JADX INFO: loaded from: classes8.dex */
@Metadata(d1 = {"\u0000\u0017\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000*\u0001\u0000\b\n\u0018\u00002\u00020\u0001J\u0010\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H\u0016¨\u0006\u0006"}, d2 = {"com/aipsoft/aipsoftconnect/MainActivity$fetchLocation$mLocationCallback$1", "Lcom/google/android/gms/location/LocationCallback;", "onLocationResult", "", "locationResult", "Lcom/google/android/gms/location/LocationResult;", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
public final class MainActivity$fetchLocation$mLocationCallback$1 extends LocationCallback {
    final /* synthetic */ MainActivity this$0;

    MainActivity$fetchLocation$mLocationCallback$1(MainActivity $receiver) {
        this.this$0 = $receiver;
    }

    @Override // com.google.android.gms.location.LocationCallback
    public void onLocationResult(LocationResult locationResult) {
        Intrinsics.checkNotNullParameter(locationResult, "locationResult");
        for (Location location : locationResult.getLocations()) {
            if (location != null) {
                this.this$0.latitude = String.valueOf(location.getLatitude());
                this.this$0.longitude = String.valueOf(location.getLongitude());
                WebView webView = this.this$0.myWebView;
                if (webView != null) {
                    final MainActivity mainActivity = this.this$0;
                    webView.post(new Runnable() { // from class: com.aipsoft.aipsoftconnect.MainActivity$fetchLocation$mLocationCallback$1$$ExternalSyntheticLambda0
                        @Override // java.lang.Runnable
                        public final void run() {
                            MainActivity$fetchLocation$mLocationCallback$1.onLocationResult$lambda$0(mainActivity);
                        }
                    });
                }
            }
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onLocationResult$lambda$0(MainActivity this$0) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        WebView webView = this$0.myWebView;
        if (webView != null) {
            webView.evaluateJavascript("setCurrentPosition('" + this$0.latitude + "','" + this$0.longitude + "');", null);
        }
    }
}
