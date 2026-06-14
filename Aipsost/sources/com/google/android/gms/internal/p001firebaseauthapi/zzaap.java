package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.util.Strings;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaap implements zzxn {
    private static final String zza = zzaap.class.getSimpleName();
    private String zzb;
    private String zzc;
    private Boolean zzd;
    private String zze;
    private String zzf;
    private zzaag zzg;
    private String zzh;
    private String zzi;
    private long zzj;

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxn
    public final /* bridge */ /* synthetic */ zzxn zza(String str) throws zzvg {
        try {
            JSONObject jSONObject = new JSONObject(str);
            this.zzb = Strings.emptyToNull(jSONObject.optString("email", null));
            this.zzc = Strings.emptyToNull(jSONObject.optString("passwordHash", null));
            this.zzd = Boolean.valueOf(jSONObject.optBoolean("emailVerified", false));
            this.zze = Strings.emptyToNull(jSONObject.optString("displayName", null));
            this.zzf = Strings.emptyToNull(jSONObject.optString("photoUrl", null));
            this.zzg = zzaag.zza(jSONObject.optJSONArray("providerUserInfo"));
            this.zzh = Strings.emptyToNull(jSONObject.optString("idToken", null));
            this.zzi = Strings.emptyToNull(jSONObject.optString("refreshToken", null));
            this.zzj = jSONObject.optLong("expiresIn", 0L);
            return this;
        } catch (NullPointerException | JSONException e) {
            throw zzabk.zza(e, zza, str);
        }
    }

    public final long zzb() {
        return this.zzj;
    }

    public final String zzc() {
        return this.zzb;
    }

    public final String zzd() {
        return this.zzh;
    }

    public final String zze() {
        return this.zzi;
    }

    public final List zzf() {
        zzaag zzaagVar = this.zzg;
        if (zzaagVar != null) {
            return zzaagVar.zzc();
        }
        return null;
    }
}
