package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final /* synthetic */ class zzxf {
    public static String zza(zzxg zzxgVar, String str) {
        try {
            String str2 = new String(MessageDigest.getInstance("SHA-256").digest(str.getBytes()));
            int length = str2.length();
            int i = 0;
            while (i < length) {
                if (zzi.zza(str2.charAt(i))) {
                    char[] charArray = str2.toCharArray();
                    while (i < length) {
                        char c = charArray[i];
                        if (zzi.zza(c)) {
                            charArray[i] = (char) (c ^ ' ');
                        }
                        i++;
                    }
                    return String.valueOf(charArray);
                }
                i++;
            }
            return str2;
        } catch (NoSuchAlgorithmException e) {
            zzxg.zza.e("Failed to get SHA-256 MessageDigest", new Object[0]);
            return null;
        }
    }
}
