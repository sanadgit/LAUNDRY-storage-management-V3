package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.PhoneMultiFactorAssertion;
import com.google.firebase.auth.internal.zzg;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzvn extends zzyb {
    private final zzrm zza;

    public zzvn(PhoneMultiFactorAssertion phoneMultiFactorAssertion, String str, String str2) {
        super(2);
        Preconditions.checkNotNull(phoneMultiFactorAssertion);
        Preconditions.checkNotEmpty(str);
        this.zza = new zzrm(phoneMultiFactorAssertion.zza(), str, str2);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final String zza() {
        return "finalizeMfaEnrollment";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyb
    public final void zzb() {
        ((zzg) this.zzf).zza(this.zzj, zzwy.zzN(this.zzd, this.zzk));
        zzm(null);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final void zzc(TaskCompletionSource taskCompletionSource, zzxb zzxbVar) {
        this.zzv = new zzya(this, taskCompletionSource);
        zzxbVar.zzh(this.zza, this.zzc);
    }
}
