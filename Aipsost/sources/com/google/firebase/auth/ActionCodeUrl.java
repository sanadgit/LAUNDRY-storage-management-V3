package com.google.firebase.auth;

import android.net.Uri;
import com.google.android.gms.common.internal.Preconditions;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class ActionCodeUrl {
    private static final Map zza;
    private final String zzb;
    private final String zzc;
    private final String zzd;
    private final String zze;
    private final String zzf;
    private final String zzg;

    static {
        HashMap map = new HashMap();
        map.put("recoverEmail", 2);
        map.put("resetPassword", 0);
        map.put("signIn", 4);
        map.put("verifyEmail", 1);
        map.put("verifyBeforeChangeEmail", 5);
        map.put("revertSecondFactorAddition", 6);
        zza = Collections.unmodifiableMap(map);
    }

    private ActionCodeUrl(String str) {
        String strZzb = zzb(str, "apiKey");
        String strZzb2 = zzb(str, "oobCode");
        String strZzb3 = zzb(str, "mode");
        if (strZzb == null || strZzb2 == null || strZzb3 == null) {
            throw new IllegalArgumentException(String.format("%s, %s and %s are required in a valid action code URL", "apiKey", "oobCode", "mode"));
        }
        this.zzb = Preconditions.checkNotEmpty(strZzb);
        this.zzc = Preconditions.checkNotEmpty(strZzb2);
        this.zzd = Preconditions.checkNotEmpty(strZzb3);
        this.zze = zzb(str, "continueUrl");
        this.zzf = zzb(str, "languageCode");
        this.zzg = zzb(str, "tenantId");
    }

    public static ActionCodeUrl parseLink(String link) {
        Preconditions.checkNotEmpty(link);
        try {
            return new ActionCodeUrl(link);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static String zzb(String str, String str2) {
        Uri uri = Uri.parse(str);
        try {
            Set<String> queryParameterNames = uri.getQueryParameterNames();
            if (queryParameterNames.contains(str2)) {
                return uri.getQueryParameter(str2);
            }
            if (queryParameterNames.contains("link")) {
                return Uri.parse(Preconditions.checkNotEmpty(uri.getQueryParameter("link"))).getQueryParameter(str2);
            }
            return null;
        } catch (NullPointerException e) {
            return null;
        } catch (UnsupportedOperationException e2) {
            return null;
        }
    }

    public String getApiKey() {
        return this.zzb;
    }

    public String getCode() {
        return this.zzc;
    }

    public String getContinueUrl() {
        return this.zze;
    }

    public String getLanguageCode() {
        return this.zzf;
    }

    public int getOperation() {
        Map map = zza;
        if (map.containsKey(this.zzd)) {
            return ((Integer) map.get(this.zzd)).intValue();
        }
        return 3;
    }

    public final String zza() {
        return this.zzg;
    }
}
