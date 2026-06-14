package com.google.android.gms.internal.safetynet;

import android.os.RemoteException;
import com.google.android.gms.common.api.Api;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.internal.safetynet.zzk;
import java.util.ArrayList;

/* JADX INFO: loaded from: classes.dex */
final class zzn extends zzk.zzf {
    private final /* synthetic */ int[] zzaa;
    private final /* synthetic */ int zzab;
    private final /* synthetic */ String zzx;
    private final /* synthetic */ String zzz;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzn(GoogleApiClient googleApiClient, int[] iArr, int i, String str, String str2) {
        super(googleApiClient);
        this.zzaa = iArr;
        this.zzab = i;
        this.zzz = str;
        this.zzx = str2;
    }

    @Override // com.google.android.gms.common.api.internal.BaseImplementation.ApiMethodImpl
    protected final /* synthetic */ void doExecute(Api.AnyClient anyClient) throws RemoteException {
        zzx zzxVar = (zzx) anyClient;
        ArrayList arrayList = new ArrayList();
        for (int i : this.zzaa) {
            arrayList.add(Integer.valueOf(i));
        }
        zzxVar.zza(this.zzaf, arrayList, this.zzab, this.zzz, this.zzx);
    }
}
