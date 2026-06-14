package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.internal.zzg;
import com.google.firebase.auth.internal.zzr;
import com.google.firebase.auth.internal.zzx;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzwg extends zzyb {
    private final zzsk zza;

    public zzwg(String str) {
        super(2);
        this.zza = new zzsk(str);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final String zza() {
        return "signInAnonymously";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyb
    public final void zzb() {
        zzx zzxVarZzN = zzwy.zzN(this.zzd, this.zzk);
        ((zzg) this.zzf).zza(this.zzj, zzxVarZzN);
        zzm(new zzr(zzxVarZzN));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final void zzc(TaskCompletionSource taskCompletionSource, zzxb zzxbVar) {
        this.zzv = new zzya(this, taskCompletionSource);
        zzxbVar.zzt(this.zza, this.zzc);
    }
}
