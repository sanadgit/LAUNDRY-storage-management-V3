package com.google.android.gms.internal.p001firebaseauthapi;

import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaat implements zzxn {
    private static final String zza = zzaat.class.getSimpleName();
    private String zzb;

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxn
    public final /* bridge */ /* synthetic */ zzxn zza(String str) throws zzvg {
        try {
            JSONObject jSONObjectOptJSONObject = new JSONObject(str).optJSONObject("phoneSessionInfo");
            if (jSONObjectOptJSONObject != null) {
                this.zzb = zzag.zza(jSONObjectOptJSONObject.optString("sessionInfo"));
            }
            return this;
        } catch (NullPointerException | JSONException e) {
            throw zzabk.zza(e, zza, str);
        }
    }

    public final String zzb() {
        return this.zzb;
    }
}
