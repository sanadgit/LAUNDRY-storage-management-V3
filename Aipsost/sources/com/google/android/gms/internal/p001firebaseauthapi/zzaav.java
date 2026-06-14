package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.util.Strings;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaav implements zzxn {
    private static final String zza = zzaav.class.getSimpleName();
    private String zzb;

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxn
    public final /* bridge */ /* synthetic */ zzxn zza(String str) throws zzvg {
        try {
            JSONObject jSONObjectOptJSONObject = new JSONObject(str).optJSONObject("phoneResponseInfo");
            if (jSONObjectOptJSONObject != null) {
                this.zzb = Strings.emptyToNull(jSONObjectOptJSONObject.optString("sessionInfo"));
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
