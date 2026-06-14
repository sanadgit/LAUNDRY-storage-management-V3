package com.google.android.gms.internal.p001firebaseauthapi;

import androidx.collection.ArrayMap;
import com.google.firebase.FirebaseApp;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzyz {
    private static final Map zza = new ArrayMap();
    private static final Map zzb = new ArrayMap();

    public static String zza(String str) {
        zzyx zzyxVar;
        Map map = zza;
        synchronized (map) {
            zzyxVar = (zzyx) map.get(str);
        }
        if (zzyxVar != null) {
            return zzh(zzyxVar.zzb(), zzyxVar.zza(), zzyxVar.zzb().contains(":")).concat("emulator/auth/handler");
        }
        throw new IllegalStateException("Tried to get the emulator widget endpoint, but no emulator endpoint overrides found.");
    }

    public static String zzb(String str) {
        zzyx zzyxVar;
        Map map = zza;
        synchronized (map) {
            zzyxVar = (zzyx) map.get(str);
        }
        return (zzyxVar != null ? "".concat(zzh(zzyxVar.zzb(), zzyxVar.zza(), zzyxVar.zzb().contains(":"))) : "https://").concat("www.googleapis.com/identitytoolkit/v3/relyingparty");
    }

    public static String zzc(String str) {
        zzyx zzyxVar;
        Map map = zza;
        synchronized (map) {
            zzyxVar = (zzyx) map.get(str);
        }
        return (zzyxVar != null ? "".concat(zzh(zzyxVar.zzb(), zzyxVar.zza(), zzyxVar.zzb().contains(":"))) : "https://").concat("identitytoolkit.googleapis.com/v2");
    }

    public static String zzd(String str) {
        zzyx zzyxVar;
        Map map = zza;
        synchronized (map) {
            zzyxVar = (zzyx) map.get(str);
        }
        return (zzyxVar != null ? "".concat(zzh(zzyxVar.zzb(), zzyxVar.zza(), zzyxVar.zzb().contains(":"))) : "https://").concat("securetoken.googleapis.com/v1");
    }

    public static void zze(String str, zzyy zzyyVar) {
        Map map = zzb;
        synchronized (map) {
            if (map.containsKey(str)) {
                ((List) map.get(str)).add(new WeakReference(zzyyVar));
            } else {
                ArrayList arrayList = new ArrayList();
                arrayList.add(new WeakReference(zzyyVar));
                map.put(str, arrayList);
            }
        }
    }

    public static void zzf(FirebaseApp firebaseApp, String str, int i) {
        String apiKey = firebaseApp.getOptions().getApiKey();
        Map map = zza;
        synchronized (map) {
            map.put(apiKey, new zzyx(str, i));
        }
        Map map2 = zzb;
        synchronized (map2) {
            if (map2.containsKey(apiKey)) {
                Iterator it = ((List) map2.get(apiKey)).iterator();
                boolean z = false;
                while (it.hasNext()) {
                    zzyy zzyyVar = (zzyy) ((WeakReference) it.next()).get();
                    if (zzyyVar != null) {
                        zzyyVar.zzi();
                        z = true;
                    }
                }
                if (!z) {
                    zza.remove(apiKey);
                }
            }
        }
    }

    public static boolean zzg(FirebaseApp firebaseApp) {
        return zza.containsKey(firebaseApp.getOptions().getApiKey());
    }

    private static String zzh(String str, int i, boolean z) {
        if (z) {
            return "http://[" + str + "]:" + i + "/";
        }
        return "http://" + str + ":" + i + "/";
    }
}
