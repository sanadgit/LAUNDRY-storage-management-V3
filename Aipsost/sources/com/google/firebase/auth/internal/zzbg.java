package com.google.firebase.auth.internal;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Parcelable;
import android.text.TextUtils;
import android.util.Log;
import androidx.exifinterface.media.ExifInterface;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.logging.Logger;
import com.google.android.gms.internal.p001firebaseauthapi.zzqx;
import com.google.android.gms.internal.p001firebaseauthapi.zzzy;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.MultiFactorInfo;
import com.google.firebase.auth.PhoneMultiFactorInfo;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbg {
    private final Context zza;
    private final String zzb;
    private final SharedPreferences zzc;
    private final Logger zzd;

    public zzbg(Context context, String str) {
        Preconditions.checkNotNull(context);
        String strCheckNotEmpty = Preconditions.checkNotEmpty(str);
        this.zzb = strCheckNotEmpty;
        Context applicationContext = context.getApplicationContext();
        this.zza = applicationContext;
        this.zzc = applicationContext.getSharedPreferences(String.format("com.google.firebase.auth.api.Store.%s", strCheckNotEmpty), 0);
        this.zzd = new Logger("StorageHelpers", new String[0]);
    }

    private final zzx zzf(JSONObject jSONObject) {
        JSONArray jSONArray;
        PhoneMultiFactorInfo phoneMultiFactorInfo;
        zzz zzzVar;
        try {
            try {
                String string = jSONObject.getString("cachedTokenState");
                String string2 = jSONObject.getString("applicationName");
                boolean z = jSONObject.getBoolean("anonymous");
                String str = ExifInterface.GPS_MEASUREMENT_2D;
                String string3 = jSONObject.getString("version");
                if (string3 != null) {
                    str = string3;
                }
                JSONArray jSONArray2 = jSONObject.getJSONArray("userInfos");
                int length = jSONArray2.length();
                ArrayList arrayList = new ArrayList(length);
                for (int i = 0; i < length; i++) {
                    String string4 = jSONArray2.getString(i);
                    Parcelable.Creator<zzt> creator = zzt.CREATOR;
                    try {
                        JSONObject jSONObject2 = new JSONObject(string4);
                        arrayList.add(new zzt(jSONObject2.optString("userId"), jSONObject2.optString("providerId"), jSONObject2.optString("email"), jSONObject2.optString("phoneNumber"), jSONObject2.optString("displayName"), jSONObject2.optString("photoUrl"), jSONObject2.optBoolean("isEmailVerified"), jSONObject2.optString("rawUserInfo")));
                    } catch (JSONException e) {
                        Log.d("DefaultAuthUserInfo", "Failed to unpack UserInfo from JSON");
                        throw new zzqx(e);
                    }
                }
                zzx zzxVar = new zzx(FirebaseApp.getInstance(string2), arrayList);
                if (!TextUtils.isEmpty(string)) {
                    zzxVar.zzh(zzzy.zzd(string));
                }
                if (!z) {
                    zzxVar.zzm();
                }
                zzxVar.zzl(str);
                if (jSONObject.has("userMetadata")) {
                    JSONObject jSONObject3 = jSONObject.getJSONObject("userMetadata");
                    Parcelable.Creator<zzz> creator2 = zzz.CREATOR;
                    if (jSONObject3 == null) {
                        zzzVar = null;
                    } else {
                        try {
                            zzzVar = new zzz(jSONObject3.getLong("lastSignInTimestamp"), jSONObject3.getLong("creationTimestamp"));
                        } catch (JSONException e2) {
                            zzzVar = null;
                        }
                    }
                    if (zzzVar != null) {
                        zzxVar.zzr(zzzVar);
                    }
                }
                if (jSONObject.has("userMultiFactorInfo") && (jSONArray = jSONObject.getJSONArray("userMultiFactorInfo")) != null) {
                    ArrayList arrayList2 = new ArrayList();
                    for (int i2 = 0; i2 < jSONArray.length(); i2++) {
                        JSONObject jSONObject4 = new JSONObject(jSONArray.getString(i2));
                        if ("phone".equals(jSONObject4.optString(MultiFactorInfo.FACTOR_ID_KEY))) {
                            Parcelable.Creator<PhoneMultiFactorInfo> creator3 = PhoneMultiFactorInfo.CREATOR;
                            if (!jSONObject4.has("enrollmentTimestamp")) {
                                throw new IllegalArgumentException("An enrollment timestamp in seconds of UTC time since Unix epoch is required to build a PhoneMultiFactorInfo instance.");
                            }
                            phoneMultiFactorInfo = new PhoneMultiFactorInfo(jSONObject4.optString("uid"), jSONObject4.optString("displayName"), jSONObject4.optLong("enrollmentTimestamp"), jSONObject4.optString("phoneNumber"));
                        } else {
                            phoneMultiFactorInfo = null;
                        }
                        arrayList2.add(phoneMultiFactorInfo);
                    }
                    zzxVar.zzi(arrayList2);
                }
                return zzxVar;
            } catch (zzqx e3) {
                e = e3;
                this.zzd.wtf(e);
                return null;
            } catch (ArrayIndexOutOfBoundsException e4) {
                e = e4;
                this.zzd.wtf(e);
                return null;
            } catch (IllegalArgumentException e5) {
                e = e5;
                this.zzd.wtf(e);
                return null;
            }
        } catch (JSONException e6) {
            e = e6;
            this.zzd.wtf(e);
            return null;
        }
    }

    public final FirebaseUser zza() {
        String string = this.zzc.getString("com.google.firebase.auth.FIREBASE_USER", null);
        if (TextUtils.isEmpty(string)) {
            return null;
        }
        try {
            JSONObject jSONObject = new JSONObject(string);
            if (jSONObject.has("type") && "com.google.firebase.auth.internal.DefaultFirebaseUser".equalsIgnoreCase(jSONObject.optString("type"))) {
                return zzf(jSONObject);
            }
        } catch (Exception e) {
        }
        return null;
    }

    public final zzzy zzb(FirebaseUser firebaseUser) {
        Preconditions.checkNotNull(firebaseUser);
        String string = this.zzc.getString(String.format("com.google.firebase.auth.GET_TOKEN_RESPONSE.%s", firebaseUser.getUid()), null);
        if (string != null) {
            return zzzy.zzd(string);
        }
        return null;
    }

    public final void zzc(String str) {
        this.zzc.edit().remove(str).apply();
    }

    public final void zzd(FirebaseUser firebaseUser) {
        String string;
        Preconditions.checkNotNull(firebaseUser);
        JSONObject jSONObject = new JSONObject();
        if (zzx.class.isAssignableFrom(firebaseUser.getClass())) {
            zzx zzxVar = (zzx) firebaseUser;
            try {
                jSONObject.put("cachedTokenState", zzxVar.zzf());
                jSONObject.put("applicationName", zzxVar.zza().getName());
                jSONObject.put("type", "com.google.firebase.auth.internal.DefaultFirebaseUser");
                if (zzxVar.zzo() != null) {
                    JSONArray jSONArray = new JSONArray();
                    List listZzo = zzxVar.zzo();
                    int size = listZzo.size();
                    if (listZzo.size() > 30) {
                        this.zzd.w("Provider user info list size larger than max size, truncating list to %d. Actual list size: %d", 30, Integer.valueOf(listZzo.size()));
                        size = 30;
                    }
                    for (int i = 0; i < size; i++) {
                        jSONArray.put(((zzt) listZzo.get(i)).zzb());
                    }
                    jSONObject.put("userInfos", jSONArray);
                }
                jSONObject.put("anonymous", zzxVar.isAnonymous());
                jSONObject.put("version", ExifInterface.GPS_MEASUREMENT_2D);
                if (zzxVar.getMetadata() != null) {
                    jSONObject.put("userMetadata", ((zzz) zzxVar.getMetadata()).zza());
                }
                List<MultiFactorInfo> enrolledFactors = new zzac(zzxVar).getEnrolledFactors();
                if (!enrolledFactors.isEmpty()) {
                    JSONArray jSONArray2 = new JSONArray();
                    for (int i2 = 0; i2 < enrolledFactors.size(); i2++) {
                        jSONArray2.put(enrolledFactors.get(i2).toJson());
                    }
                    jSONObject.put("userMultiFactorInfo", jSONArray2);
                }
                string = jSONObject.toString();
            } catch (Exception e) {
                this.zzd.wtf("Failed to turn object into JSON", e, new Object[0]);
                throw new zzqx(e);
            }
        } else {
            string = null;
        }
        if (TextUtils.isEmpty(string)) {
            return;
        }
        this.zzc.edit().putString("com.google.firebase.auth.FIREBASE_USER", string).apply();
    }

    public final void zze(FirebaseUser firebaseUser, zzzy zzzyVar) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(zzzyVar);
        this.zzc.edit().putString(String.format("com.google.firebase.auth.GET_TOKEN_RESPONSE.%s", firebaseUser.getUid()), zzzyVar.zzh()).apply();
    }
}
