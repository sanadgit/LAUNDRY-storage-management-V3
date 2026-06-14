package com.google.android.gms.internal.p000authapiphone;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.api.internal.TaskUtil;
import com.google.android.gms.tasks.TaskCompletionSource;

/* JADX INFO: compiled from: com.google.android.gms:play-services-auth-api-phone@@17.4.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzt extends zze {
    private final /* synthetic */ TaskCompletionSource zza;

    zzt(zzn zznVar, TaskCompletionSource taskCompletionSource) {
        this.zza = taskCompletionSource;
    }

    @Override // com.google.android.gms.internal.p000authapiphone.zzf
    public final void zza(Status status, int i) {
        TaskUtil.setResultOrApiException(status, Integer.valueOf(i), this.zza);
    }
}
