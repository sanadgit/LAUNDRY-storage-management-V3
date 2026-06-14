package com.google.android.gms.measurement.internal;

import android.content.SharedPreferences;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzey {
    final /* synthetic */ zzfb zza;
    private final String zzb;
    private final long zzc;
    private boolean zzd;
    private long zze;

    public zzey(zzfb zzfbVar, String str, long j) {
        this.zza = zzfbVar;
        Preconditions.checkNotEmpty(str);
        this.zzb = str;
        this.zzc = j;
    }

    public final long zza() {
        if (!this.zzd) {
            this.zzd = true;
            this.zze = this.zza.zzd().getLong(this.zzb, this.zzc);
        }
        return this.zze;
    }

    public final void zzb(long j) {
        SharedPreferences.Editor editorEdit = this.zza.zzd().edit();
        editorEdit.putLong(this.zzb, j);
        editorEdit.apply();
        this.zze = j;
    }
}
