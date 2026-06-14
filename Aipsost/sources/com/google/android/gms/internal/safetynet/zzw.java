package com.google.android.gms.internal.safetynet;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.internal.safetynet.zzk;
import com.google.android.gms.safetynet.SafeBrowsingData;

/* JADX INFO: loaded from: classes.dex */
final class zzw extends zze {
    private final /* synthetic */ zzk.zzf zzak;

    zzw(zzk.zzf zzfVar) {
        this.zzak = zzfVar;
    }

    @Override // com.google.android.gms.internal.safetynet.zze, com.google.android.gms.internal.safetynet.zzg
    public final void zza(Status status, SafeBrowsingData safeBrowsingData) {
        this.zzak.setResult(new zzk.zzi(status, safeBrowsingData));
    }
}
