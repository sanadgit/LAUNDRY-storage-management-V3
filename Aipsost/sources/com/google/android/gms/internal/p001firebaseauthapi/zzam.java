package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.analytics.FirebaseAnalytics;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzam extends zzal {
    static final zzal zza = new zzam(new Object[0], 0);
    final transient Object[] zzb;

    zzam(Object[] objArr, int i) {
        this.zzb = objArr;
    }

    @Override // java.util.List
    public final Object get(int i) {
        zzy.zza(i, 0, FirebaseAnalytics.Param.INDEX);
        Object obj = this.zzb[i];
        obj.getClass();
        return obj;
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return 0;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzal, com.google.android.gms.internal.p001firebaseauthapi.zzai
    final int zza(Object[] objArr, int i) {
        System.arraycopy(this.zzb, 0, objArr, 0, 0);
        return 0;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzai
    final int zzb() {
        return 0;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzai
    final int zzc() {
        return 0;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzai
    final Object[] zze() {
        return this.zzb;
    }
}
