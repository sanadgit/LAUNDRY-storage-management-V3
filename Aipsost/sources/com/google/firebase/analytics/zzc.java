package com.google.firebase.analytics;

import android.os.Bundle;
import com.google.android.gms.internal.measurement.zzee;
import com.google.android.gms.measurement.internal.zzgu;
import com.google.android.gms.measurement.internal.zzgv;
import com.google.android.gms.measurement.internal.zzhx;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzc implements zzhx {
    final /* synthetic */ zzee zza;

    zzc(zzee zzeeVar) {
        this.zza = zzeeVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zza(String str, String str2, Bundle bundle) {
        this.zza.zzh(str, str2, bundle);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zzb(String str, String str2, Bundle bundle, long j) {
        this.zza.zzi(str, str2, bundle, j);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final Map<String, Object> zzc(String str, String str2, boolean z) {
        return this.zza.zzB(str, str2, z);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zzd(zzgu zzguVar) {
        this.zza.zzd(zzguVar);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zze(zzgv zzgvVar) {
        this.zza.zze(zzgvVar);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zzf(zzgv zzgvVar) {
        this.zza.zzf(zzgvVar);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final String zzg() {
        return this.zza.zzz();
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final String zzh() {
        return this.zza.zzA();
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final String zzi() {
        return this.zza.zzx();
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final String zzj() {
        return this.zza.zzw();
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final long zzk() {
        return this.zza.zzy();
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zzl(String str) {
        this.zza.zzu(str);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zzm(String str) {
        this.zza.zzv(str);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zzn(Bundle bundle) {
        this.zza.zzk(bundle);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final void zzo(String str, String str2, Bundle bundle) {
        this.zza.zzl(str, str2, bundle);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final List<Bundle> zzp(String str, String str2) {
        return this.zza.zzm(str, str2);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final int zzq(String str) {
        return this.zza.zzE(str);
    }

    @Override // com.google.android.gms.measurement.internal.zzhx
    public final Object zzr(int i) {
        return this.zza.zzH(i);
    }
}
