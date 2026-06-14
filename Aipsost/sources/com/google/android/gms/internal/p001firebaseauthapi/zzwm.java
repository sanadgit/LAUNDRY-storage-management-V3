package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.internal.zzag;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzwm extends zzyb {
    private final zzsw zza;

    public zzwm(zzag zzagVar, String str, String str2, long j, boolean z, boolean z2, String str3, String str4, boolean z3) {
        super(8);
        Preconditions.checkNotNull(zzagVar);
        Preconditions.checkNotEmpty(str);
        this.zza = new zzsw(Preconditions.checkNotEmpty(zzagVar.zzc()), str, str2, j, z, z2, str3, str4, z3);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final String zza() {
        return "startMfaEnrollmentWithPhoneNumber";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyb
    public final void zzb() {
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final void zzc(TaskCompletionSource taskCompletionSource, zzxb zzxbVar) {
        this.zzv = new zzya(this, taskCompletionSource);
        zzxbVar.zzz(this.zza, this.zzc);
    }
}
