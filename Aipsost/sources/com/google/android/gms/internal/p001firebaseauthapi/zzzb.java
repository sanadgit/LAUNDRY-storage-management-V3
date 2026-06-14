package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import android.util.Log;
import com.google.firebase.messaging.Constants;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzzb implements zzxn {
    private static final String zza = zzzb.class.getName();
    private String zzb;

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxn
    public final /* bridge */ /* synthetic */ zzxn zza(String str) throws zzvg {
        zzb(str);
        return this;
    }

    public final zzzb zzb(String str) throws zzvg {
        try {
            JSONObject jSONObject = new JSONObject(new JSONObject(str).getString(Constants.IPC_BUNDLE_KEY_SEND_ERROR));
            jSONObject.getInt("code");
            this.zzb = jSONObject.getString("message");
            return this;
        } catch (NullPointerException | JSONException e) {
            Log.e(zza, "Failed to parse error for string [" + str + "] with exception: " + e.getMessage());
            throw new zzvg("Failed to parse error for string [" + str + "]", e);
        }
    }

    public final String zzc() {
        return this.zzb;
    }

    public final boolean zzd() {
        return !TextUtils.isEmpty(this.zzb);
    }
}
