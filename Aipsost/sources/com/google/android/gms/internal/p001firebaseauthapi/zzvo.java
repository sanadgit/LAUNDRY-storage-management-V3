package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.FirebaseError;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.PhoneMultiFactorAssertion;
import com.google.firebase.auth.internal.zzg;
import com.google.firebase.auth.internal.zzr;
import com.google.firebase.auth.internal.zzx;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzvo extends zzyb {
    private final zzro zza;

    public zzvo(PhoneMultiFactorAssertion phoneMultiFactorAssertion, String str) {
        super(2);
        Preconditions.checkNotNull(phoneMultiFactorAssertion);
        Preconditions.checkNotEmpty(str);
        this.zza = new zzro(phoneMultiFactorAssertion.zza(), str);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final String zza() {
        return "finalizeMfaSignIn";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyb
    public final void zzb() {
        zzx zzxVarZzN = zzwy.zzN(this.zzd, this.zzk);
        FirebaseUser firebaseUser = this.zze;
        if (firebaseUser != null && !firebaseUser.getUid().equalsIgnoreCase(zzxVarZzN.getUid())) {
            zzl(new Status(FirebaseError.ERROR_USER_MISMATCH));
        } else {
            ((zzg) this.zzf).zza(this.zzj, zzxVarZzN);
            zzm(new zzr(zzxVarZzN));
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final void zzc(TaskCompletionSource taskCompletionSource, zzxb zzxbVar) {
        this.zzv = new zzya(this, taskCompletionSource);
        zzxbVar.zzi(this.zza, this.zzc);
    }
}
