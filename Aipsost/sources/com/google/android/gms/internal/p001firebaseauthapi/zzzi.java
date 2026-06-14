package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.internal.Preconditions;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzzi implements zzxm {
    private final String zza = Preconditions.checkNotEmpty("phone");
    private String zzb;
    private final String zzc;
    private final String zzd;
    private final String zze;

    zzzi(String str, String str2, String str3, String str4, String str5, String str6, String str7) {
        this.zzb = Preconditions.checkNotEmpty(str2);
        this.zzc = str3;
        this.zze = str4;
        this.zzd = str7;
    }

    public static zzzi zzb(String str, String str2, String str3, String str4) {
        Preconditions.checkNotEmpty(str3);
        Preconditions.checkNotEmpty(str2);
        return new zzzi("phone", str, str2, str3, null, null, str4);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxm
    public final String zza() throws JSONException {
        JSONObject jSONObject = new JSONObject();
        jSONObject.put("idToken", this.zzb);
        this.zza.hashCode();
        jSONObject.put("mfaProvider", 1);
        String str = this.zzd;
        if (str != null) {
            jSONObject.put("displayName", str);
        }
        JSONObject jSONObject2 = new JSONObject();
        String str2 = this.zzc;
        if (str2 != null) {
            jSONObject2.put("sessionInfo", str2);
        }
        String str3 = this.zze;
        if (str3 != null) {
            jSONObject2.put("code", str3);
        }
        jSONObject.put("phoneVerificationInfo", jSONObject2);
        return jSONObject.toString();
    }

    public final zzzi zzc(String str) {
        this.zzb = str;
        return this;
    }
}
