package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzab extends zzad {
    final /* synthetic */ zzp zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzab(zzac zzacVar, zzaf zzafVar, CharSequence charSequence, zzp zzpVar) {
        super(zzafVar, charSequence);
        this.zza = zzpVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzad
    public final int zzc(int i) {
        return ((zzs) this.zza).zza.end();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzad
    public final int zzd(int i) {
        if (((zzs) this.zza).zza.find(i)) {
            return ((zzs) this.zza).zza.start();
        }
        return -1;
    }
}
