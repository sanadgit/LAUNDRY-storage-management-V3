package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.internal.zzay;
import com.google.firebase.auth.internal.zzg;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzvp extends zzyb {
    private final zzrq zza;

    public zzvp(String str) {
        super(1);
        Preconditions.checkNotEmpty(str, "refresh token cannot be null");
        this.zza = new zzrq(str);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final String zza() {
        return "getAccessToken";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyb
    public final void zzb() {
        if (TextUtils.isEmpty(this.zzj.zzf())) {
            this.zzj.zzi(this.zza.zza());
        }
        ((zzg) this.zzf).zza(this.zzj, this.zze);
        zzm(zzay.zza(this.zzj.zze()));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyd
    public final void zzc(TaskCompletionSource taskCompletionSource, zzxb zzxbVar) {
        this.zzv = new zzya(this, taskCompletionSource);
        zzxbVar.zzj(this.zza, this.zzc);
    }
}
