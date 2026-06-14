package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.logging.Logger;
import com.google.firebase.auth.ActionCodeUrl;
import com.google.firebase.auth.EmailAuthCredential;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzzg implements zzxm {
    private static final String zza;
    private static final Logger zzb;
    private final String zzc;
    private final String zzd;
    private final String zze;

    static {
        String simpleName = zzzg.class.getSimpleName();
        zza = simpleName;
        zzb = new Logger(simpleName, new String[0]);
    }

    public zzzg(EmailAuthCredential emailAuthCredential, String str) {
        this.zzc = Preconditions.checkNotEmpty(emailAuthCredential.zzd());
        this.zzd = Preconditions.checkNotEmpty(emailAuthCredential.zzf());
        this.zze = str;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxm
    public final String zza() throws JSONException {
        ActionCodeUrl link = ActionCodeUrl.parseLink(this.zzd);
        String code = link != null ? link.getCode() : null;
        String strZza = link != null ? link.zza() : null;
        JSONObject jSONObject = new JSONObject();
        jSONObject.put("email", this.zzc);
        if (code != null) {
            jSONObject.put("oobCode", code);
        }
        if (strZza != null) {
            jSONObject.put("tenantId", strZza);
        }
        String str = this.zze;
        if (str != null) {
            jSONObject.put("idToken", str);
        }
        return jSONObject.toString();
    }
}
