package com.google.firebase.auth.internal;

import android.text.TextUtils;
import android.util.Log;
import androidx.collection.ArrayMap;
import com.bumptech.glide.load.Key;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.logging.Logger;
import com.google.android.gms.common.util.Base64Utils;
import com.google.android.gms.internal.p001firebaseauthapi.zzqx;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaz {
    private static final Logger zza = new Logger("JSONParser", new String[0]);

    static List zza(JSONArray jSONArray) throws JSONException {
        ArrayList arrayList = new ArrayList();
        for (int i = 0; i < jSONArray.length(); i++) {
            Object objZzd = jSONArray.get(i);
            if (objZzd instanceof JSONArray) {
                objZzd = zza((JSONArray) objZzd);
            } else if (objZzd instanceof JSONObject) {
                objZzd = zzd((JSONObject) objZzd);
            }
            arrayList.add(objZzd);
        }
        return arrayList;
    }

    public static Map zzb(String str) {
        Preconditions.checkNotEmpty(str);
        List listZzd = com.google.android.gms.internal.p001firebaseauthapi.zzaf.zzb('.').zzd(str);
        if (listZzd.size() < 2) {
            zza.e("Invalid idToken ".concat(String.valueOf(str)), new Object[0]);
            return new HashMap();
        }
        try {
            Map mapZzc = zzc(new String(Base64Utils.decodeUrlSafeNoPadding((String) listZzd.get(1)), Key.STRING_CHARSET_NAME));
            return mapZzc == null ? new HashMap() : mapZzc;
        } catch (UnsupportedEncodingException e) {
            zza.e("Unable to decode token", e, new Object[0]);
            return new HashMap();
        }
    }

    public static Map zzc(String str) {
        if (TextUtils.isEmpty(str)) {
            return null;
        }
        try {
            JSONObject jSONObject = new JSONObject(str);
            if (jSONObject != JSONObject.NULL) {
                return zzd(jSONObject);
            }
            return null;
        } catch (Exception e) {
            Log.d("JSONParser", "Failed to parse JSONObject into Map.");
            throw new zzqx(e);
        }
    }

    static Map zzd(JSONObject jSONObject) throws JSONException {
        ArrayMap arrayMap = new ArrayMap();
        Iterator<String> itKeys = jSONObject.keys();
        while (itKeys.hasNext()) {
            String next = itKeys.next();
            Object objZzd = jSONObject.get(next);
            if (objZzd instanceof JSONArray) {
                objZzd = zza((JSONArray) objZzd);
            } else if (objZzd instanceof JSONObject) {
                objZzd = zzd((JSONObject) objZzd);
            }
            arrayMap.put(next, objZzd);
        }
        return arrayMap;
    }
}
