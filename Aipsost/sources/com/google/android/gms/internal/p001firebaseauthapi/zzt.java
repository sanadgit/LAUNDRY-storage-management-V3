package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.Serializable;
import java.util.regex.Pattern;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzt extends zzq implements Serializable {
    private final Pattern zza;

    zzt(Pattern pattern) {
        if (pattern == null) {
            throw null;
        }
        this.zza = pattern;
    }

    public final String toString() {
        return this.zza.toString();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzq
    public final zzp zza(CharSequence charSequence) {
        return new zzs(this.zza.matcher(charSequence));
    }
}
