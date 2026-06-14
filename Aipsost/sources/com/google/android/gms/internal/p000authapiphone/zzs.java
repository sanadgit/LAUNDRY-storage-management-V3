package com.google.android.gms.internal.p000authapiphone;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.api.internal.TaskUtil;
import com.google.android.gms.tasks.TaskCompletionSource;

/* JADX INFO: compiled from: com.google.android.gms:play-services-auth-api-phone@@17.4.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzs extends zzg {
    private final /* synthetic */ TaskCompletionSource zza;

    zzs(zzn zznVar, TaskCompletionSource taskCompletionSource) {
        this.zza = taskCompletionSource;
    }

    @Override // com.google.android.gms.internal.p000authapiphone.zzh
    public final void zza(Status status, boolean z) {
        TaskUtil.setResultOrApiException(status, Boolean.valueOf(z), this.zza);
    }
}
