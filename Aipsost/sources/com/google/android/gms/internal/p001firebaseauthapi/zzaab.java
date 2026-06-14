package com.google.android.gms.internal.p001firebaseauthapi;

import android.util.Log;
import java.io.UnsupportedEncodingException;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaab {
    private String zza;
    private String zzb;
    private String zzc;
    private Long zzd;
    private Long zze;

    public static zzaab zza(String str) throws UnsupportedEncodingException {
        try {
            zzaab zzaabVar = new zzaab();
            JSONObject jSONObject = new JSONObject(str);
            zzaabVar.zza = jSONObject.optString("iss");
            zzaabVar.zzb = jSONObject.optString("aud");
            zzaabVar.zzc = jSONObject.optString("sub");
            zzaabVar.zzd = Long.valueOf(jSONObject.optLong("iat"));
            zzaabVar.zze = Long.valueOf(jSONObject.optLong("exp"));
            jSONObject.optBoolean("is_anonymous");
            return zzaabVar;
        } catch (JSONException e) {
            if (Log.isLoggable("JwtToken", 3)) {
                Log.d("JwtToken", "Failed to read JwtToken from JSONObject. ".concat(e.toString()));
            }
            throw new UnsupportedEncodingException("Failed to read JwtToken from JSONObject. ".concat(e.toString()));
        }
    }

    public final Long zzb() {
        return this.zze;
    }

    public final Long zzc() {
        return this.zzd;
    }
}
