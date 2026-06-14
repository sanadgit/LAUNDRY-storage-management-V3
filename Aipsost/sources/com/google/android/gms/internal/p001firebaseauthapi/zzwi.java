package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.internal.zzg;
import com.google.firebase.auth.internal.zzr;
import com.google.firebase.auth.internal.zzx;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzwi extends zzyb {
    private final zzso zza;

    public zzwi(String str, String str2) {
        super(2);
        Preconditions.checkNotEmpty(str, "token cannot be null or empty");
        this.zza = new zzso(str, str2);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final String zza() {
        return "signInWithCustomToken";
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
        zzxbVar.zzv(this.zza, this.zzc);
    }
}
