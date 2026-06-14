package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzafp extends zzafn {
    zzafp() {
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* synthetic */ int zza(Object obj) {
        return ((zzafo) obj).zza();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* synthetic */ int zzb(Object obj) {
        return ((zzafo) obj).zzb();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* bridge */ /* synthetic */ Object zzc(Object obj) {
        zzadf zzadfVar = (zzadf) obj;
        zzafo zzafoVar = zzadfVar.zzc;
        if (zzafoVar != zzafo.zzc()) {
            return zzafoVar;
        }
        zzafo zzafoVarZzf = zzafo.zzf();
        zzadfVar.zzc = zzafoVarZzf;
        return zzafoVarZzf;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* synthetic */ Object zzd(Object obj) {
        return ((zzadf) obj).zzc;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* bridge */ /* synthetic */ Object zze(Object obj, Object obj2) {
        if (zzafo.zzc().equals(obj2)) {
            return obj;
        }
        if (zzafo.zzc().equals(obj)) {
            return zzafo.zze((zzafo) obj, (zzafo) obj2);
        }
        ((zzafo) obj).zzd((zzafo) obj2);
        return obj;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* synthetic */ Object zzf() {
        return zzafo.zzf();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* synthetic */ Object zzg(Object obj) {
        ((zzafo) obj).zzh();
        return obj;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* bridge */ /* synthetic */ void zzh(Object obj, int i, int i2) {
        ((zzafo) obj).zzj((i << 3) | 5, Integer.valueOf(i2));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* bridge */ /* synthetic */ void zzi(Object obj, int i, long j) {
        ((zzafo) obj).zzj((i << 3) | 1, Long.valueOf(j));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* bridge */ /* synthetic */ void zzj(Object obj, int i, Object obj2) {
        ((zzafo) obj).zzj((i << 3) | 3, obj2);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* bridge */ /* synthetic */ void zzk(Object obj, int i, zzacc zzaccVar) {
        ((zzafo) obj).zzj((i << 3) | 2, zzaccVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* bridge */ /* synthetic */ void zzl(Object obj, int i, long j) {
        ((zzafo) obj).zzj(i << 3, Long.valueOf(j));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final void zzm(Object obj) {
        ((zzadf) obj).zzc.zzh();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* synthetic */ void zzn(Object obj, Object obj2) {
        ((zzadf) obj).zzc = (zzafo) obj2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* synthetic */ void zzo(Object obj, Object obj2) {
        ((zzadf) obj).zzc = (zzafo) obj2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final boolean zzq(zzaev zzaevVar) {
        return false;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzafn
    final /* synthetic */ void zzr(Object obj, zzaco zzacoVar) throws IOException {
        ((zzafo) obj).zzk(zzacoVar);
    }
}
