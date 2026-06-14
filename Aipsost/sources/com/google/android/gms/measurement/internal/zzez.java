package com.google.android.gms.measurement.internal;

import android.content.SharedPreferences;
import android.util.Pair;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzez {
    final String zza;
    final /* synthetic */ zzfb zzb;
    private final String zzc;
    private final String zzd;
    private final long zze;

    /* synthetic */ zzez(zzfb zzfbVar, String str, long j, zzev zzevVar) {
        this.zzb = zzfbVar;
        Preconditions.checkNotEmpty("health_monitor");
        Preconditions.checkArgument(j > 0);
        this.zza = "health_monitor:start";
        this.zzc = "health_monitor:count";
        this.zzd = "health_monitor:value";
        this.zze = j;
    }

    private final void zzc() {
        this.zzb.zzg();
        long jCurrentTimeMillis = this.zzb.zzs.zzay().currentTimeMillis();
        SharedPreferences.Editor editorEdit = this.zzb.zzd().edit();
        editorEdit.remove(this.zzc);
        editorEdit.remove(this.zzd);
        editorEdit.putLong(this.zza, jCurrentTimeMillis);
        editorEdit.apply();
    }

    private final long zzd() {
        return this.zzb.zzd().getLong(this.zza, 0L);
    }

    public final void zza(String str, long j) {
        this.zzb.zzg();
        if (zzd() == 0) {
            zzc();
        }
        if (str == null) {
            str = "";
        }
        long j2 = this.zzb.zzd().getLong(this.zzc, 0L);
        if (j2 <= 0) {
            SharedPreferences.Editor editorEdit = this.zzb.zzd().edit();
            editorEdit.putString(this.zzd, str);
            editorEdit.putLong(this.zzc, 1L);
            editorEdit.apply();
            return;
        }
        long jNextLong = this.zzb.zzs.zzl().zzf().nextLong();
        long j3 = j2 + 1;
        long j4 = Long.MAX_VALUE / j3;
        SharedPreferences.Editor editorEdit2 = this.zzb.zzd().edit();
        if ((jNextLong & Long.MAX_VALUE) < j4) {
            editorEdit2.putString(this.zzd, str);
        }
        editorEdit2.putLong(this.zzc, j3);
        editorEdit2.apply();
    }

    public final Pair<String, Long> zzb() {
        long jAbs;
        this.zzb.zzg();
        this.zzb.zzg();
        long jZzd = zzd();
        if (jZzd == 0) {
            zzc();
            jAbs = 0;
        } else {
            jAbs = Math.abs(jZzd - this.zzb.zzs.zzay().currentTimeMillis());
        }
        long j = this.zze;
        if (jAbs < j) {
            return null;
        }
        if (jAbs > j + j) {
            zzc();
            return null;
        }
        String string = this.zzb.zzd().getString(this.zzd, null);
        long j2 = this.zzb.zzd().getLong(this.zzc, 0L);
        zzc();
        return (string == null || j2 <= 0) ? zzfb.zza : new Pair<>(string, Long.valueOf(j2));
    }
}
