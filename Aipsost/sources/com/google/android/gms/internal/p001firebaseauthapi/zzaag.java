package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.android.gms.common.util.Strings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaag extends AbstractSafeParcelable {
    public static final Parcelable.Creator<zzaag> CREATOR = new zzaah();
    private final List zza;

    public zzaag() {
        this.zza = new ArrayList();
    }

    public static zzaag zza(JSONArray jSONArray) throws JSONException {
        if (jSONArray == null || jSONArray.length() == 0) {
            return new zzaag(new ArrayList());
        }
        ArrayList arrayList = new ArrayList();
        for (int i = 0; i < jSONArray.length(); i++) {
            JSONObject jSONObject = jSONArray.getJSONObject(i);
            arrayList.add(jSONObject == null ? new zzaae() : new zzaae(Strings.emptyToNull(jSONObject.optString("federatedId", null)), Strings.emptyToNull(jSONObject.optString("displayName", null)), Strings.emptyToNull(jSONObject.optString("photoUrl", null)), Strings.emptyToNull(jSONObject.optString("providerId", null)), null, Strings.emptyToNull(jSONObject.optString("phoneNumber", null)), Strings.emptyToNull(jSONObject.optString("email", null))));
        }
        return new zzaag(arrayList);
    }

    public static zzaag zzb(zzaag zzaagVar) {
        List list = zzaagVar.zza;
        zzaag zzaagVar2 = new zzaag();
        if (list != null) {
            zzaagVar2.zza.addAll(list);
        }
        return zzaagVar2;
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeTypedList(parcel, 2, this.zza, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    public final List zzc() {
        return this.zza;
    }

    zzaag(List list) {
        if (list == null || list.isEmpty()) {
            this.zza = Collections.emptyList();
        } else {
            this.zza = Collections.unmodifiableList(list);
        }
    }
}
