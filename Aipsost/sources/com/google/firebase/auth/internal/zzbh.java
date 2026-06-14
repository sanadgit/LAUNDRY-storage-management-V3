package com.google.firebase.auth.internal;

import com.google.android.gms.common.api.internal.BackgroundDetector;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzbh implements BackgroundDetector.BackgroundStateChangeListener {
    final /* synthetic */ zzbi zza;

    zzbh(zzbi zzbiVar) {
        this.zza = zzbiVar;
    }

    @Override // com.google.android.gms.common.api.internal.BackgroundDetector.BackgroundStateChangeListener
    public final void onBackgroundStateChanged(boolean z) {
        if (z) {
            this.zza.zzc = true;
            this.zza.zzc();
        } else {
            this.zza.zzc = false;
            if (this.zza.zzg()) {
                this.zza.zzb.zzc();
            }
        }
    }
}
