package com.google.android.gms.cloudmessaging;

import android.os.Bundle;
import com.google.firebase.messaging.Constants;

/* JADX INFO: compiled from: com.google.android.gms:play-services-cloud-messaging@@16.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzs extends zzq<Bundle> {
    zzs(int i, int i2, Bundle bundle) {
        super(i, 1, bundle);
    }

    @Override // com.google.android.gms.cloudmessaging.zzq
    final boolean zza() {
        return false;
    }

    @Override // com.google.android.gms.cloudmessaging.zzq
    final void zza(Bundle bundle) {
        Bundle bundle2 = bundle.getBundle(Constants.ScionAnalytics.MessageType.DATA_MESSAGE);
        if (bundle2 == null) {
            bundle2 = Bundle.EMPTY;
        }
        zza(bundle2);
    }
}
