package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.analytics.FirebaseAnalytics;
import java.util.List;
import javax.annotation.CheckForNull;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzak extends zzal {
    final transient int zza;
    final transient int zzb;
    final /* synthetic */ zzal zzc;

    zzak(zzal zzalVar, int i, int i2) {
        this.zzc = zzalVar;
        this.zza = i;
        this.zzb = i2;
    }

    @Override // java.util.List
    public final Object get(int i) {
        zzy.zza(i, this.zzb, FirebaseAnalytics.Param.INDEX);
        return this.zzc.get(i + this.zza);
    }

    @Override // java.util.AbstractCollection, java.util.Collection, java.util.List
    public final int size() {
        return this.zzb;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzal, java.util.List
    public final /* bridge */ /* synthetic */ List subList(int i, int i2) {
        return subList(i, i2);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzai
    final int zzb() {
        return this.zzc.zzc() + this.zza + this.zzb;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzai
    final int zzc() {
        return this.zzc.zzc() + this.zza;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzai
    @CheckForNull
    final Object[] zze() {
        return this.zzc.zze();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzal
    /* JADX INFO: renamed from: zzf */
    public final zzal subList(int i, int i2) {
        zzy.zzc(i, i2, this.zzb);
        zzal zzalVar = this.zzc;
        int i3 = this.zza;
        return zzalVar.subList(i + i3, i2 + i3);
    }
}
