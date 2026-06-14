package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import com.google.android.gms.common.util.Strings;
import com.google.firebase.auth.zze;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaba implements zzxn {
    private static final String zza = zzaba.class.getSimpleName();
    private boolean zzb;
    private String zzc;
    private String zzd;
    private long zze;
    private String zzf;
    private String zzg;
    private String zzh;
    private String zzi;
    private String zzj;
    private String zzk;
    private boolean zzl;
    private String zzm;
    private String zzn;
    private String zzo;
    private String zzp;
    private String zzq;
    private String zzr;
    private List zzs;
    private String zzt;

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxn
    public final /* bridge */ /* synthetic */ zzxn zza(String str) throws zzvg {
        try {
            JSONObject jSONObject = new JSONObject(str);
            this.zzb = jSONObject.optBoolean("needConfirmation", false);
            jSONObject.optBoolean("needEmail", false);
            this.zzc = Strings.emptyToNull(jSONObject.optString("idToken", null));
            this.zzd = Strings.emptyToNull(jSONObject.optString("refreshToken", null));
            this.zze = jSONObject.optLong("expiresIn", 0L);
            this.zzf = Strings.emptyToNull(jSONObject.optString("localId", null));
            this.zzg = Strings.emptyToNull(jSONObject.optString("email", null));
            this.zzh = Strings.emptyToNull(jSONObject.optString("displayName", null));
            this.zzi = Strings.emptyToNull(jSONObject.optString("photoUrl", null));
            this.zzj = Strings.emptyToNull(jSONObject.optString("providerId", null));
            this.zzk = Strings.emptyToNull(jSONObject.optString("rawUserInfo", null));
            this.zzl = jSONObject.optBoolean("isNewUser", false);
            this.zzm = jSONObject.optString("oauthAccessToken", null);
            this.zzn = jSONObject.optString("oauthIdToken", null);
            this.zzp = Strings.emptyToNull(jSONObject.optString("errorMessage", null));
            this.zzq = Strings.emptyToNull(jSONObject.optString("pendingToken", null));
            this.zzr = Strings.emptyToNull(jSONObject.optString("tenantId", null));
            this.zzs = zzaac.zzf(jSONObject.optJSONArray("mfaInfo"));
            this.zzt = Strings.emptyToNull(jSONObject.optString("mfaPendingCredential", null));
            this.zzo = Strings.emptyToNull(jSONObject.optString("oauthTokenSecret", null));
            return this;
        } catch (NullPointerException | JSONException e) {
            throw zzabk.zza(e, zza, str);
        }
    }

    public final long zzb() {
        return this.zze;
    }

    public final zze zzc() {
        if (TextUtils.isEmpty(this.zzm) && TextUtils.isEmpty(this.zzn)) {
            return null;
        }
        return zze.zzc(this.zzj, this.zzn, this.zzm, this.zzq, this.zzo);
    }

    public final String zzd() {
        return this.zzg;
    }

    public final String zze() {
        return this.zzp;
    }

    public final String zzf() {
        return this.zzc;
    }

    public final String zzg() {
        return this.zzt;
    }

    public final String zzh() {
        return this.zzj;
    }

    public final String zzi() {
        return this.zzk;
    }

    public final String zzj() {
        return this.zzd;
    }

    public final String zzk() {
        return this.zzr;
    }

    public final List zzl() {
        return this.zzs;
    }

    public final boolean zzm() {
        return !TextUtils.isEmpty(this.zzt);
    }

    public final boolean zzn() {
        return this.zzb;
    }

    public final boolean zzo() {
        return this.zzl;
    }

    public final boolean zzp() {
        return this.zzb || !TextUtils.isEmpty(this.zzp);
    }
}
