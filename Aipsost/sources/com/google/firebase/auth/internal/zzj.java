package com.google.firebase.auth.internal;

import android.content.Context;
import android.content.SharedPreferences;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import java.util.Iterator;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzj {
    private static final zzj zza = new zzj();

    private zzj() {
    }

    public static zzj zzb() {
        return zza;
    }

    private static void zzf(SharedPreferences sharedPreferences) {
        SharedPreferences.Editor editorEdit = sharedPreferences.edit();
        Iterator<String> it = sharedPreferences.getAll().keySet().iterator();
        while (it.hasNext()) {
            editorEdit.remove(it.next());
        }
        editorEdit.apply();
    }

    private static final SharedPreferences zzg(Context context, String str) {
        return context.getSharedPreferences(String.format("com.google.firebase.auth.internal.browserSignInSessionStore.%s", str), 0);
    }

    public final synchronized zzi zza(Context context, String str, String str2) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        SharedPreferences sharedPreferencesZzg = zzg(context, str);
        String str3 = String.format("com.google.firebase.auth.internal.EVENT_ID.%s.SESSION_ID", str2);
        String str4 = String.format("com.google.firebase.auth.internal.EVENT_ID.%s.OPERATION", str2);
        String str5 = String.format("com.google.firebase.auth.internal.EVENT_ID.%s.PROVIDER_ID", str2);
        String str6 = String.format("com.google.firebase.auth.internal.EVENT_ID.%s.FIREBASE_APP_NAME", str2);
        String string = sharedPreferencesZzg.getString(str3, null);
        String string2 = sharedPreferencesZzg.getString(str4, null);
        String string3 = sharedPreferencesZzg.getString(str5, null);
        String string4 = sharedPreferencesZzg.getString("com.google.firebase.auth.api.gms.config.tenant.id", null);
        String string5 = sharedPreferencesZzg.getString(str6, null);
        SharedPreferences.Editor editorEdit = sharedPreferencesZzg.edit();
        editorEdit.remove(str3);
        editorEdit.remove(str4);
        editorEdit.remove(str5);
        editorEdit.remove(str6);
        editorEdit.apply();
        if (string == null || string2 == null || string3 == null) {
            return null;
        }
        return new zzi(string, string2, string3, string4, string5);
    }

    public final synchronized String zzc(Context context, String str, String str2) {
        String string;
        String string2;
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        SharedPreferences sharedPreferencesZzg = zzg(context, str);
        String str3 = String.format("com.google.firebase.auth.internal.EVENT_ID.%s.OPERATION", str2);
        string = sharedPreferencesZzg.getString(str3, null);
        String str4 = String.format("com.google.firebase.auth.internal.EVENT_ID.%s.FIREBASE_APP_NAME", str2);
        string2 = sharedPreferencesZzg.getString(str4, null);
        SharedPreferences.Editor editorEdit = sharedPreferencesZzg.edit();
        editorEdit.remove(str3);
        editorEdit.remove(str4);
        editorEdit.apply();
        if (TextUtils.isEmpty(string)) {
            return null;
        }
        return string2;
    }

    public final synchronized void zzd(Context context, String str, String str2, String str3, String str4, String str5, String str6, String str7) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotEmpty(str3);
        Preconditions.checkNotEmpty(str7);
        SharedPreferences sharedPreferencesZzg = zzg(context, str);
        zzf(sharedPreferencesZzg);
        SharedPreferences.Editor editorEdit = sharedPreferencesZzg.edit();
        editorEdit.putString(String.format("com.google.firebase.auth.internal.EVENT_ID.%s.SESSION_ID", str2), str3);
        editorEdit.putString(String.format("com.google.firebase.auth.internal.EVENT_ID.%s.OPERATION", str2), str4);
        editorEdit.putString(String.format("com.google.firebase.auth.internal.EVENT_ID.%s.PROVIDER_ID", str2), str5);
        editorEdit.putString(String.format("com.google.firebase.auth.internal.EVENT_ID.%s.FIREBASE_APP_NAME", str2), str7);
        editorEdit.putString("com.google.firebase.auth.api.gms.config.tenant.id", str6);
        editorEdit.apply();
    }

    public final synchronized void zze(Context context, String str, String str2, String str3, String str4) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        SharedPreferences sharedPreferencesZzg = zzg(context, str);
        zzf(sharedPreferencesZzg);
        SharedPreferences.Editor editorEdit = sharedPreferencesZzg.edit();
        editorEdit.putString(String.format("com.google.firebase.auth.internal.EVENT_ID.%s.OPERATION", str2), "com.google.firebase.auth.internal.ACTION_SHOW_RECAPTCHA");
        editorEdit.putString(String.format("com.google.firebase.auth.internal.EVENT_ID.%s.FIREBASE_APP_NAME", str2), str4);
        editorEdit.apply();
    }
}
