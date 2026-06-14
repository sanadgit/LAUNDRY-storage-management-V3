package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.FirebaseError;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.internal.zzg;
import com.google.firebase.auth.internal.zzh;
import com.google.firebase.auth.internal.zzr;
import com.google.firebase.auth.internal.zzx;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzvv extends zzyb {
    private final zzsm zza;

    public zzvv(AuthCredential authCredential, String str) {
        super(2);
        Preconditions.checkNotNull(authCredential, "credential cannot be null");
        zzaay zzaayVarZza = zzh.zza(authCredential, str);
        zzaayVarZza.zzb(false);
        this.zza = new zzsm(zzaayVarZza);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final String zza() {
        return "reauthenticateWithCredentialWithData";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyb
    public final void zzb() {
        zzx zzxVarZzN = zzwy.zzN(this.zzd, this.zzk);
        if (!this.zze.getUid().equalsIgnoreCase(zzxVarZzN.getUid())) {
            zzl(new Status(FirebaseError.ERROR_USER_MISMATCH));
        } else {
            ((zzg) this.zzf).zza(this.zzj, zzxVarZzN);
            zzm(new zzr(zzxVarZzN));
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final void zzc(TaskCompletionSource taskCompletionSource, zzxb zzxbVar) {
        this.zzv = new zzya(this, taskCompletionSource);
        zzxbVar.zzu(this.zza, this.zzc);
    }
}
