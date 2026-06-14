package com.google.android.gms.internal.measurement;

import android.content.Context;
import android.net.Uri;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzhr {
    final Uri zzb;
    final String zza = null;
    final String zzc = "";
    final String zzd = "";
    final boolean zze = false;
    final boolean zzf = false;
    final boolean zzg = false;
    final boolean zzh = false;

    @Nullable
    final zzhy<Context, Boolean> zzi = null;

    public zzhr(Uri uri) {
        this.zzb = uri;
    }

    public final zzht<Long> zza(String str, long j) {
        return new zzhn(this, str, Long.valueOf(j), true);
    }

    public final zzht<Boolean> zzb(String str, boolean z) {
        return new zzho(this, str, Boolean.valueOf(z), true);
    }

    public final zzht<Double> zzc(String str, double d) {
        return new zzhp(this, "measurement.test.double_flag", Double.valueOf(-3.0d), true);
    }

    public final zzht<String> zzd(String str, String str2) {
        return new zzhq(this, str, str2, true);
    }
}
