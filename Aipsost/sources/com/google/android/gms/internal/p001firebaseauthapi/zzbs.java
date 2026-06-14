package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Arrays;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzbs implements Comparable {
    private final byte[] zza;

    @Override // java.lang.Comparable
    public final /* bridge */ /* synthetic */ int compareTo(Object obj) {
        zzbs zzbsVar = (zzbs) obj;
        int length = this.zza.length;
        int length2 = zzbsVar.zza.length;
        if (length != length2) {
            return length - length2;
        }
        int i = 0;
        while (true) {
            byte[] bArr = this.zza;
            if (i >= bArr.length) {
                return 0;
            }
            byte b = bArr[i];
            byte b2 = zzbsVar.zza[i];
            if (b != b2) {
                return b - b2;
            }
            i++;
        }
    }

    public final boolean equals(Object obj) {
        if (obj instanceof zzbs) {
            return Arrays.equals(this.zza, ((zzbs) obj).zza);
        }
        return false;
    }

    public final int hashCode() {
        return Arrays.hashCode(this.zza);
    }

    public final String toString() {
        return zzqj.zza(this.zza);
    }
}
