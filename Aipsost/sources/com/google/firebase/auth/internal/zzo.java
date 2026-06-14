package com.google.firebase.auth.internal;

import com.google.firebase.auth.ActionCodeInfo;
import com.google.firebase.auth.ActionCodeResult;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzo implements ActionCodeResult {
    private final int zza;
    private final String zzb;
    private final String zzc;
    private final ActionCodeInfo zzd;

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:31:0x0075  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public zzo(com.google.android.gms.internal.p001firebaseauthapi.zzaaj r10) {
        /*
            Method dump skipped, instruction units count: 250
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.firebase.auth.internal.zzo.<init>(com.google.android.gms.internal.firebase-auth-api.zzaaj):void");
    }

    @Override // com.google.firebase.auth.ActionCodeResult
    public final String getData(int i) {
        if (this.zza == 4) {
            return null;
        }
        switch (i) {
        }
        return null;
    }

    @Override // com.google.firebase.auth.ActionCodeResult
    public final ActionCodeInfo getInfo() {
        return this.zzd;
    }

    @Override // com.google.firebase.auth.ActionCodeResult
    public final int getOperation() {
        return this.zza;
    }
}
