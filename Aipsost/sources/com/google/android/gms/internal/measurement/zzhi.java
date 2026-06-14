package com.google.android.gms.internal.measurement;

import android.net.Uri;
import java.util.Map;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzhi {
    private final Map<String, Map<String, String>> zza;

    zzhi(Map<String, Map<String, String>> map) {
        this.zza = map;
    }

    @Nullable
    public final String zza(@Nullable Uri uri, @Nullable String str, @Nullable String str2, String str3) {
        if (uri == null) {
            return null;
        }
        Map<String, String> map = this.zza.get(uri.toString());
        if (map == null) {
            return null;
        }
        String strValueOf = String.valueOf(str3);
        return map.get(strValueOf.length() != 0 ? "".concat(strValueOf) : new String(""));
    }
}
