package com.google.android.gms.safetynet;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.api.internal.TaskUtil;
import com.google.android.gms.tasks.TaskCompletionSource;

/* JADX INFO: loaded from: classes.dex */
final class zzm extends com.google.android.gms.internal.safetynet.zze {
    private final /* synthetic */ TaskCompletionSource zzv;

    zzm(zzl zzlVar, TaskCompletionSource taskCompletionSource) {
        this.zzv = taskCompletionSource;
    }

    @Override // com.google.android.gms.internal.safetynet.zze, com.google.android.gms.internal.safetynet.zzg
    public final void zza(Status status) {
        TaskUtil.setResultOrApiException(status, this.zzv);
    }
}
