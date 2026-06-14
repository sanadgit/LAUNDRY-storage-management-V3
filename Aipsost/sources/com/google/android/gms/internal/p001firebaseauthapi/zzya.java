package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.FirebaseAuth;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzya {
    private final zzyb zza;
    private final TaskCompletionSource zzb;

    public zzya(zzyb zzybVar, TaskCompletionSource taskCompletionSource) {
        this.zza = zzybVar;
        this.zzb = taskCompletionSource;
    }

    public final void zza(Object obj, Status status) {
        Preconditions.checkNotNull(this.zzb, "completion source cannot be null");
        if (status == null) {
            this.zzb.setResult(obj);
            return;
        }
        zzyb zzybVar = this.zza;
        if (zzybVar.zzs != null) {
            TaskCompletionSource taskCompletionSource = this.zzb;
            FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(zzybVar.zzd);
            zzyb zzybVar2 = this.zza;
            taskCompletionSource.setException(zzxc.zzc(firebaseAuth, zzybVar2.zzs, ("reauthenticateWithCredential".equals(zzybVar2.zza()) || "reauthenticateWithCredentialWithData".equals(this.zza.zza())) ? this.zza.zze : null));
            return;
        }
        AuthCredential authCredential = zzybVar.zzp;
        if (authCredential != null) {
            this.zzb.setException(zzxc.zzb(status, authCredential, zzybVar.zzq, zzybVar.zzr));
        } else {
            this.zzb.setException(zzxc.zza(status));
        }
    }
}
