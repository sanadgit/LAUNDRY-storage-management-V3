package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaac extends AbstractSafeParcelable {
    public static final Parcelable.Creator<zzaac> CREATOR = new zzaad();
    private final String zza;
    private final String zzb;
    private final String zzc;
    private final long zzd;
    private String zze;

    public zzaac(String str, String str2, String str3, long j) {
        this.zza = str;
        this.zzb = Preconditions.checkNotEmpty(str2);
        this.zzc = str3;
        this.zzd = j;
    }

    public static zzaac zzb(JSONObject jSONObject) {
        zzaac zzaacVar = new zzaac(jSONObject.optString("phoneInfo", null), jSONObject.optString("mfaEnrollmentId", null), jSONObject.optString("displayName", null), zzg(jSONObject.optString("enrolledAt", "")));
        zzaacVar.zze = jSONObject.optString("unobfuscatedPhoneInfo");
        return zzaacVar;
    }

    public static List zzf(JSONArray jSONArray) throws JSONException {
        if (jSONArray == null || jSONArray.length() == 0) {
            return new ArrayList();
        }
        ArrayList arrayList = new ArrayList();
        for (int i = 0; i < jSONArray.length(); i++) {
            arrayList.add(zzb(jSONArray.getJSONObject(i)));
        }
        return arrayList;
    }

    private static long zzg(String str) {
        String strReplaceAll = str.replaceAll("\\.[0-9]{0,9}Z$|Z$", ".000Z");
        try {
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            simpleDateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            return simpleDateFormat.parse(strReplaceAll).getTime();
        } catch (ParseException e) {
            Log.w("MfaInfo", "Could not parse timestamp as ISOString", e);
            return 0L;
        }
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeString(parcel, 1, this.zza, false);
        SafeParcelWriter.writeString(parcel, 2, this.zzb, false);
        SafeParcelWriter.writeString(parcel, 3, this.zzc, false);
        SafeParcelWriter.writeLong(parcel, 4, this.zzd);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    public final long zza() {
        return this.zzd;
    }

    public final String zzc() {
        return this.zzc;
    }

    public final String zzd() {
        return this.zzb;
    }

    public final String zze() {
        return this.zza;
    }
}
