package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.android.gms.common.util.Strings;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzzp extends AbstractSafeParcelable implements zzxn<zzzp> {
    private zzzt zzb;
    private static final String zza = zzzp.class.getSimpleName();
    public static final Parcelable.Creator<zzzp> CREATOR = new zzzq();

    public zzzp() {
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeParcelable(parcel, 2, this.zzb, i, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxn
    public final /* bridge */ /* synthetic */ zzxn zza(String str) throws zzvg {
        zzzt zzztVar;
        int i;
        zzzr zzzrVar;
        try {
            JSONObject jSONObject = new JSONObject(str);
            if (jSONObject.has("users")) {
                JSONArray jSONArrayOptJSONArray = jSONObject.optJSONArray("users");
                Parcelable.Creator<zzzt> creator = zzzt.CREATOR;
                if (jSONArrayOptJSONArray == null || jSONArrayOptJSONArray.length() == 0) {
                    zzztVar = new zzzt(new ArrayList());
                } else {
                    ArrayList arrayList = new ArrayList(jSONArrayOptJSONArray.length());
                    boolean z = false;
                    int i2 = 0;
                    while (i2 < jSONArrayOptJSONArray.length()) {
                        JSONObject jSONObject2 = jSONArrayOptJSONArray.getJSONObject(i2);
                        if (jSONObject2 == null) {
                            zzzrVar = new zzzr();
                            i = i2;
                        } else {
                            i = i2;
                            zzzrVar = new zzzr(Strings.emptyToNull(jSONObject2.optString("localId", null)), Strings.emptyToNull(jSONObject2.optString("email", null)), jSONObject2.optBoolean("emailVerified", z), Strings.emptyToNull(jSONObject2.optString("displayName", null)), Strings.emptyToNull(jSONObject2.optString("photoUrl", null)), zzaag.zza(jSONObject2.optJSONArray("providerUserInfo")), Strings.emptyToNull(jSONObject2.optString("rawPassword", null)), Strings.emptyToNull(jSONObject2.optString("phoneNumber", null)), jSONObject2.optLong("createdAt", 0L), jSONObject2.optLong("lastLoginAt", 0L), false, null, zzaac.zzf(jSONObject2.optJSONArray("mfaInfo")));
                        }
                        arrayList.add(zzzrVar);
                        i2 = i + 1;
                        z = false;
                    }
                    zzztVar = new zzzt(arrayList);
                }
                this.zzb = zzztVar;
            } else {
                this.zzb = new zzzt();
            }
            return this;
        } catch (NullPointerException | JSONException e) {
            throw zzabk.zza(e, zza, str);
        }
    }

    public final List zzb() {
        return this.zzb.zzb();
    }

    zzzp(zzzt zzztVar) {
        this.zzb = zzztVar == null ? new zzzt() : zzzt.zza(zzztVar);
    }
}
