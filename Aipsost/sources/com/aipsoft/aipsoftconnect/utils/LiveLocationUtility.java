package com.aipsoft.aipsoftconnect.utils;

import android.content.Context;
import android.os.Build;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.app.ActivityCompat;
import kotlin.Metadata;
import kotlin.jvm.internal.Intrinsics;
import pub.devrel.easypermissions.EasyPermissions;

/* JADX INFO: compiled from: LiveLocationUtility.kt */
/* JADX INFO: loaded from: classes7.dex */
@Metadata(d1 = {"\u0000$\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u0011\n\u0002\u0010\u000e\n\u0002\b\u0006\n\u0002\u0010\u000b\n\u0000\n\u0002\u0018\u0002\n\u0000\bÆ\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002¢\u0006\u0002\u0010\u0002J\u000e\u0010\u000b\u001a\u00020\f2\u0006\u0010\r\u001a\u00020\u000eR\"\u0010\u0003\u001a\b\u0012\u0004\u0012\u00020\u00050\u0004X\u0086\u000e¢\u0006\u0010\n\u0002\u0010\n\u001a\u0004\b\u0006\u0010\u0007\"\u0004\b\b\u0010\t¨\u0006\u000f"}, d2 = {"Lcom/aipsoft/aipsoftconnect/utils/LiveLocationUtility;", "", "()V", "locationPermission", "", "", "getLocationPermission", "()[Ljava/lang/String;", "setLocationPermission", "([Ljava/lang/String;)V", "[Ljava/lang/String;", "hasLocationPermission", "", "context", "Landroid/content/Context;", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
public final class LiveLocationUtility {
    public static final LiveLocationUtility INSTANCE = new LiveLocationUtility();
    private static String[] locationPermission;

    private LiveLocationUtility() {
    }

    public final boolean hasLocationPermission(Context context) {
        Intrinsics.checkNotNullParameter(context, "context");
        if (Build.VERSION.SDK_INT < 29) {
            return EasyPermissions.hasPermissions(context, "android.permission.ACCESS_FINE_LOCATION");
        }
        return ActivityCompat.checkSelfPermission(context, "android.permission.ACCESS_BACKGROUND_LOCATION") == 0 && EasyPermissions.hasPermissions(context, "android.permission.ACCESS_FINE_LOCATION");
    }

    static {
        String[] strArr;
        if (Build.VERSION.SDK_INT >= 29) {
            strArr = new String[]{"android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_BACKGROUND_LOCATION"};
        } else {
            strArr = new String[]{"android.permission.ACCESS_FINE_LOCATION"};
        }
        locationPermission = strArr;
    }

    public final String[] getLocationPermission() {
        return locationPermission;
    }

    public final void setLocationPermission(String[] strArr) {
        Intrinsics.checkNotNullParameter(strArr, "<set-?>");
        locationPermission = strArr;
    }
}
