package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import android.util.Log;
import com.google.android.gms.common.internal.LibraryVersion;
import java.util.List;
import kotlin.time.DurationKt;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzxo {
    private final int zza;

    /* JADX WARN: Multi-variable type inference failed */
    /* JADX WARN: Type inference failed for: r1v1, types: [java.lang.Object[]] */
    /* JADX WARN: Type inference failed for: r9v0, types: [java.lang.CharSequence, java.lang.String] */
    /* JADX WARN: Type inference failed for: r9v1 */
    /* JADX WARN: Type inference failed for: r9v5 */
    /* JADX WARN: Type inference failed for: r9v6 */
    /* JADX WARN: Type inference failed for: r9v7 */
    /* JADX WARN: Type inference failed for: r9v8 */
    public zzxo(String str) {
        int i = -1;
        try {
            List listZzd = zzaf.zzc("[.-]").zzd(str);
            if (listZzd.size() == 1) {
                i = Integer.parseInt(str);
                str = str;
            } else {
                str = str;
                if (listZzd.size() >= 3) {
                    int i2 = (Integer.parseInt((String) listZzd.get(0)) * DurationKt.NANOS_IN_MILLIS) + (Integer.parseInt((String) listZzd.get(1)) * 1000);
                    int i3 = Integer.parseInt((String) listZzd.get(2));
                    i = i2 + i3;
                    str = i3;
                }
            }
        } catch (IllegalArgumentException e) {
            if (Log.isLoggable("LibraryVersionContainer", 3)) {
                Log.d("LibraryVersionContainer", String.format("Version code parsing failed for: %s with exception %s.", new Object[]{str, e}));
            }
        }
        this.zza = i;
    }

    public static zzxo zza() throws Throwable {
        String version = LibraryVersion.getInstance().getVersion("firebase-auth");
        if (TextUtils.isEmpty(version) || version.equals("UNKNOWN")) {
            version = "-1";
        }
        return new zzxo(version);
    }

    public final String zzb() {
        return String.format("X%s", Integer.toString(this.zza));
    }
}
