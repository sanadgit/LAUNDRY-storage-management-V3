package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.analytics.FirebaseAnalytics;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzz extends zzad {
    final /* synthetic */ zzaa zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzz(zzaa zzaaVar, zzaf zzafVar, CharSequence charSequence) {
        super(zzafVar, charSequence);
        this.zza = zzaaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzad
    final int zzc(int i) {
        return i + 1;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzad
    final int zzd(int i) {
        CharSequence charSequence = this.zzb;
        int length = charSequence.length();
        zzy.zzb(i, length, FirebaseAnalytics.Param.INDEX);
        while (i < length) {
            if (charSequence.charAt(i) == '.') {
                return i;
            }
            i++;
        }
        return -1;
    }
}
