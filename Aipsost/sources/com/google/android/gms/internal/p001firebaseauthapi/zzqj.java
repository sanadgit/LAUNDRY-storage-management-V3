package com.google.android.gms.internal.p001firebaseauthapi;

import kotlin.UByte;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzqj {
    public static String zza(byte[] bArr) {
        int length = bArr.length;
        StringBuilder sb = new StringBuilder(length + length);
        for (byte b : bArr) {
            int i = b & UByte.MAX_VALUE;
            sb.append("0123456789abcdef".charAt(i >> 4));
            sb.append("0123456789abcdef".charAt(i & 15));
        }
        return sb.toString();
    }
}
