package com.google.android.gms.safetynet;

import android.os.RemoteException;
import com.google.android.gms.common.api.Api;
import com.google.android.gms.common.api.internal.TaskApiCall;
import com.google.android.gms.internal.safetynet.zzx;
import com.google.android.gms.tasks.TaskCompletionSource;

/* JADX INFO: loaded from: classes.dex */
final class zzn extends TaskApiCall<zzx, Void> {
    zzn(SafetyNetClient safetyNetClient) {
    }

    @Override // com.google.android.gms.common.api.internal.TaskApiCall
    protected final /* synthetic */ void doExecute(Api.AnyClient anyClient, TaskCompletionSource<Void> taskCompletionSource) throws RemoteException {
        ((com.google.android.gms.internal.safetynet.zzi) ((zzx) anyClient).getService()).zzb();
    }
}
