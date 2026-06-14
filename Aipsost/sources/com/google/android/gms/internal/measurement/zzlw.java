package com.google.android.gms.internal.measurement;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzlw extends zzmd {
    zzlw(int i) {
        super(i, null);
    }

    @Override // com.google.android.gms.internal.measurement.zzmd
    public final void zza() {
        if (!zzb()) {
            for (int i = 0; i < zzc(); i++) {
                Map.Entry entryZzd = zzd(i);
                if (((zzjt) entryZzd.getKey()).zzc()) {
                    entryZzd.setValue(Collections.unmodifiableList((List) entryZzd.getValue()));
                }
            }
            for (Map.Entry entry : zze()) {
                if (((zzjt) entry.getKey()).zzc()) {
                    entry.setValue(Collections.unmodifiableList((List) entry.getValue()));
                }
            }
        }
        super.zza();
    }
}
