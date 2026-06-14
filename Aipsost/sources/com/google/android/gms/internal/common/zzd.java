package com.google.android.gms.internal.common;

import android.os.Build;
import androidx.core.view.accessibility.AccessibilityEventCompat;

/* JADX INFO: compiled from: com.google.android.gms:play-services-basement@@18.3.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzd {
    public static final int zza;

    static {
        zza = Build.VERSION.SDK_INT >= 23 ? AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL : 0;
    }
}
