package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import java.util.Iterator;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzan {
    final String zza;
    final String zzb;
    final String zzc;
    final long zzd;
    final long zze;
    final zzaq zzf;

    zzan(zzfu zzfuVar, String str, String str2, String str3, long j, long j2, Bundle bundle) {
        zzaq zzaqVar;
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotEmpty(str3);
        this.zza = str2;
        this.zzb = str3;
        this.zzc = true == TextUtils.isEmpty(str) ? null : str;
        this.zzd = j;
        this.zze = j2;
        if (j2 != 0 && j2 > j) {
            zzfuVar.zzau().zze().zzb("Event created with reverse previous/current timestamps. appId", zzem.zzl(str2));
        }
        if (bundle == null || bundle.isEmpty()) {
            zzaqVar = new zzaq(new Bundle());
        } else {
            Bundle bundle2 = new Bundle(bundle);
            Iterator<String> it = bundle2.keySet().iterator();
            while (it.hasNext()) {
                String next = it.next();
                if (next == null) {
                    zzfuVar.zzau().zzb().zza("Param name can't be null");
                    it.remove();
                } else {
                    Object objZzE = zzfuVar.zzl().zzE(next, bundle2.get(next));
                    if (objZzE == null) {
                        zzfuVar.zzau().zze().zzb("Param value can't be null", zzfuVar.zzm().zzd(next));
                        it.remove();
                    } else {
                        zzfuVar.zzl().zzL(bundle2, next, objZzE);
                    }
                }
            }
            zzaqVar = new zzaq(bundle2);
        }
        this.zzf = zzaqVar;
    }

    public final String toString() {
        String str = this.zza;
        String str2 = this.zzb;
        String strValueOf = String.valueOf(this.zzf);
        int length = String.valueOf(str).length();
        StringBuilder sb = new StringBuilder(length + 33 + String.valueOf(str2).length() + String.valueOf(strValueOf).length());
        sb.append("Event{appId='");
        sb.append(str);
        sb.append("', name='");
        sb.append(str2);
        sb.append("', params=");
        sb.append(strValueOf);
        sb.append('}');
        return sb.toString();
    }

    final zzan zza(zzfu zzfuVar, long j) {
        return new zzan(zzfuVar, this.zzc, this.zza, this.zzb, this.zzd, j, this.zzf);
    }

    private zzan(zzfu zzfuVar, String str, String str2, String str3, long j, long j2, zzaq zzaqVar) {
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotEmpty(str3);
        Preconditions.checkNotNull(zzaqVar);
        this.zza = str2;
        this.zzb = str3;
        this.zzc = true == TextUtils.isEmpty(str) ? null : str;
        this.zzd = j;
        this.zze = j2;
        if (j2 != 0 && j2 > j) {
            zzfuVar.zzau().zze().zzc("Event created with reverse previous/current timestamps. appId, name", zzem.zzl(str2), zzem.zzl(str3));
        }
        this.zzf = zzaqVar;
    }
}
