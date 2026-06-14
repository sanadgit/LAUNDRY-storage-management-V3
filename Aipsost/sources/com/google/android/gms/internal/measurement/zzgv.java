package com.google.android.gms.internal.measurement;

import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import java.util.HashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgv {
    static HashMap<String, String> zze;
    private static Object zzl;
    private static boolean zzm;
    public static final Uri zza = Uri.parse("content://com.google.android.gsf.gservices");
    public static final Uri zzb = Uri.parse("content://com.google.android.gsf.gservices/prefix");
    public static final Pattern zzc = Pattern.compile("^(1|true|t|on|yes|y)$", 2);
    public static final Pattern zzd = Pattern.compile("^(0|false|f|off|no|n)$", 2);
    private static final AtomicBoolean zzk = new AtomicBoolean();
    static final HashMap<String, Boolean> zzf = new HashMap<>();
    static final HashMap<String, Integer> zzg = new HashMap<>();
    static final HashMap<String, Long> zzh = new HashMap<>();
    static final HashMap<String, Float> zzi = new HashMap<>();
    static final String[] zzj = new String[0];

    public static String zza(ContentResolver contentResolver, String str, String str2) {
        synchronized (zzgv.class) {
            String str3 = null;
            if (zze == null) {
                zzk.set(false);
                zze = new HashMap<>();
                zzl = new Object();
                zzm = false;
                contentResolver.registerContentObserver(zza, true, new zzgu(null));
            } else if (zzk.getAndSet(false)) {
                zze.clear();
                zzf.clear();
                zzg.clear();
                zzh.clear();
                zzi.clear();
                zzl = new Object();
                zzm = false;
            }
            Object obj = zzl;
            if (zze.containsKey(str)) {
                String str4 = zze.get(str);
                if (str4 != null) {
                    str3 = str4;
                }
                return str3;
            }
            int length = zzj.length;
            Cursor cursorQuery = contentResolver.query(zza, null, null, new String[]{str}, null);
            if (cursorQuery == null) {
                return null;
            }
            try {
                if (cursorQuery.moveToFirst()) {
                    String string = cursorQuery.getString(1);
                    if (string != null && string.equals(null)) {
                        string = null;
                    }
                    zzc(obj, str, string);
                    if (string != null) {
                        str3 = string;
                    }
                } else {
                    zzc(obj, str, null);
                }
                return str3;
            } finally {
                cursorQuery.close();
            }
        }
    }

    private static void zzc(Object obj, String str, String str2) {
        synchronized (zzgv.class) {
            if (obj == zzl) {
                zze.put(str, str2);
            }
        }
    }
}
