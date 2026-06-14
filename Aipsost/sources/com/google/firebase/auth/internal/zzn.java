package com.google.firebase.auth.internal;

import com.google.android.gms.common.internal.Preconditions;
import com.google.firebase.auth.ActionCodeMultiFactorInfo;
import com.google.firebase.auth.MultiFactorInfo;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzn extends ActionCodeMultiFactorInfo {
    private final MultiFactorInfo zza;

    public zzn(String str, MultiFactorInfo multiFactorInfo) {
        this.email = Preconditions.checkNotEmpty(str);
        this.zza = (MultiFactorInfo) Preconditions.checkNotNull(multiFactorInfo);
    }

    @Override // com.google.firebase.auth.ActionCodeMultiFactorInfo
    public final MultiFactorInfo getMultiFactorInfo() {
        return this.zza;
    }
}
