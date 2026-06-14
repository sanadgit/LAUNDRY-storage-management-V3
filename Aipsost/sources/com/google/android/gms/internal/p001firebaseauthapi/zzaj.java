package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaj extends zzah {
    private final zzal zza;

    zzaj(zzal zzalVar, int i) {
        super(zzalVar.size(), i);
        this.zza = zzalVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzah
    protected final Object zza(int i) {
        return this.zza.get(i);
    }
}
