package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import com.google.firebase.auth.zze;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zztu implements zzyg {
    final /* synthetic */ zzyf zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ String zzc;
    final /* synthetic */ Boolean zzd;
    final /* synthetic */ zze zze;
    final /* synthetic */ zzxa zzf;
    final /* synthetic */ zzzy zzg;

    zztu(zzvf zzvfVar, zzyf zzyfVar, String str, String str2, Boolean bool, zze zzeVar, zzxa zzxaVar, zzzy zzzyVar) {
        this.zza = zzyfVar;
        this.zzb = str;
        this.zzc = str2;
        this.zzd = bool;
        this.zze = zzeVar;
        this.zzf = zzxaVar;
        this.zzg = zzzyVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zza.zza(str);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        List listZzb = ((zzzp) obj).zzb();
        if (listZzb == null || listZzb.isEmpty()) {
            this.zza.zza("No users.");
            return;
        }
        int i = 0;
        zzzr zzzrVar = (zzzr) listZzb.get(0);
        zzaag zzaagVarZzl = zzzrVar.zzl();
        List listZzc = zzaagVarZzl != null ? zzaagVarZzl.zzc() : null;
        if (listZzc != null && !listZzc.isEmpty()) {
            if (TextUtils.isEmpty(this.zzb)) {
                ((zzaae) listZzc.get(0)).zzh(this.zzc);
            } else {
                while (true) {
                    if (i >= listZzc.size()) {
                        break;
                    }
                    if (((zzaae) listZzc.get(i)).zzf().equals(this.zzb)) {
                        ((zzaae) listZzc.get(i)).zzh(this.zzc);
                        break;
                    }
                    i++;
                }
            }
        }
        zzzrVar.zzh(this.zzd.booleanValue());
        zzzrVar.zze(this.zze);
        this.zzf.zzi(this.zzg, zzzrVar);
    }
}
