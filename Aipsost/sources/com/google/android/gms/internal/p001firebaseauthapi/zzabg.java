package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzabg implements zzxm {
    private String zza;
    private String zzb;
    private String zzc;
    private String zzd;
    private String zze;
    private boolean zzf;

    private zzabg() {
    }

    public static zzabg zzb(String str, String str2, boolean z) {
        zzabg zzabgVar = new zzabg();
        zzabgVar.zzb = Preconditions.checkNotEmpty(str);
        zzabgVar.zzc = Preconditions.checkNotEmpty(str2);
        zzabgVar.zzf = z;
        return zzabgVar;
    }

    public static zzabg zzc(String str, String str2, boolean z) {
        zzabg zzabgVar = new zzabg();
        zzabgVar.zza = Preconditions.checkNotEmpty(str);
        zzabgVar.zzd = Preconditions.checkNotEmpty(str2);
        zzabgVar.zzf = z;
        return zzabgVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxm
    public final String zza() throws JSONException {
        JSONObject jSONObject = new JSONObject();
        if (TextUtils.isEmpty(this.zzd)) {
            jSONObject.put("sessionInfo", this.zzb);
            jSONObject.put("code", this.zzc);
        } else {
            jSONObject.put("phoneNumber", this.zza);
            jSONObject.put("temporaryProof", this.zzd);
        }
        String str = this.zze;
        if (str != null) {
            jSONObject.put("idToken", str);
        }
        if (!this.zzf) {
            jSONObject.put("operation", 2);
        }
        return jSONObject.toString();
    }

    public final void zzd(String str) {
        this.zze = str;
    }
}
