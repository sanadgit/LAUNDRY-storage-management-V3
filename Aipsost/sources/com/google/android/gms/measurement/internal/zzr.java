package com.google.android.gms.measurement.internal;

import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Pair;
import com.google.firebase.messaging.Constants;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzr {
    private final zzfu zza;

    public zzr(zzfu zzfuVar) {
        this.zza = zzfuVar;
    }

    final void zza() {
        this.zza.zzav().zzg();
        if (zze()) {
            if (zzd()) {
                this.zza.zzd().zzp.zzb(null);
                Bundle bundle = new Bundle();
                bundle.putString("source", "(not set)");
                bundle.putString("medium", "(not set)");
                bundle.putString("_cis", "intent");
                bundle.putLong("_cc", 1L);
                this.zza.zzk().zzs(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_cmpx", bundle);
            } else {
                String strZza = this.zza.zzd().zzp.zza();
                if (TextUtils.isEmpty(strZza)) {
                    this.zza.zzau().zzc().zza("Cache still valid but referrer not found");
                } else {
                    long jZza = ((this.zza.zzd().zzq.zza() / 3600000) - 1) * 3600000;
                    Uri uri = Uri.parse(strZza);
                    Bundle bundle2 = new Bundle();
                    Pair pair = new Pair(uri.getPath(), bundle2);
                    for (String str : uri.getQueryParameterNames()) {
                        bundle2.putString(str, uri.getQueryParameter(str));
                    }
                    ((Bundle) pair.second).putLong("_cc", jZza);
                    this.zza.zzk().zzs((String) pair.first, Constants.ScionAnalytics.EVENT_FIREBASE_CAMPAIGN, (Bundle) pair.second);
                }
                this.zza.zzd().zzp.zzb(null);
            }
            this.zza.zzd().zzq.zzb(0L);
        }
    }

    final void zzb(String str, Bundle bundle) {
        String string;
        this.zza.zzav().zzg();
        if (this.zza.zzF()) {
            return;
        }
        if (bundle.isEmpty()) {
            string = null;
        } else {
            if (true == str.isEmpty()) {
                str = DebugKt.DEBUG_PROPERTY_VALUE_AUTO;
            }
            Uri.Builder builder = new Uri.Builder();
            builder.path(str);
            for (String str2 : bundle.keySet()) {
                builder.appendQueryParameter(str2, bundle.getString(str2));
            }
            string = builder.build().toString();
        }
        if (TextUtils.isEmpty(string)) {
            return;
        }
        this.zza.zzd().zzp.zzb(string);
        this.zza.zzd().zzq.zzb(this.zza.zzay().currentTimeMillis());
    }

    final void zzc() {
        if (zze() && zzd()) {
            this.zza.zzd().zzp.zzb(null);
        }
    }

    final boolean zzd() {
        return zze() && this.zza.zzay().currentTimeMillis() - this.zza.zzd().zzq.zza() > this.zza.zzc().zzj(null, zzea.zzQ);
    }

    final boolean zze() {
        return this.zza.zzd().zzq.zza() > 0;
    }
}
