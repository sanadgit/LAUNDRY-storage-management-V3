package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.internal.zzan;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzvl extends zzyb {
    public zzvl() {
        super(5);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final String zza() {
        return "delete";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyb
    public final void zzb() {
        ((zzan) this.zzf).zza();
        zzm(null);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final void zzc(TaskCompletionSource taskCompletionSource, zzxb zzxbVar) {
        this.zzv = new zzya(this, taskCompletionSource);
        zzxbVar.zzg(new zzrk(this.zze.zzf()), this.zzc);
    }
}
