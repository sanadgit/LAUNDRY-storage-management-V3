package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.util.Log;
import com.google.android.gms.common.internal.Preconditions;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzeh extends zzgo {
    protected static final AtomicReference<String[]> zza = new AtomicReference<>();
    protected static final AtomicReference<String[]> zzb = new AtomicReference<>();
    protected static final AtomicReference<String[]> zzc = new AtomicReference<>();

    zzeh(zzfu zzfuVar) {
        super(zzfuVar);
    }

    private static final String zzi(String str, String[] strArr, String[] strArr2, AtomicReference<String[]> atomicReference) {
        String str2;
        Preconditions.checkNotNull(strArr);
        Preconditions.checkNotNull(strArr2);
        Preconditions.checkNotNull(atomicReference);
        Preconditions.checkArgument(strArr.length == strArr2.length);
        for (int i = 0; i < strArr.length; i++) {
            if (zzku.zzS(str, strArr[i])) {
                synchronized (atomicReference) {
                    String[] strArr3 = atomicReference.get();
                    if (strArr3 == null) {
                        strArr3 = new String[strArr2.length];
                        atomicReference.set(strArr3);
                    }
                    str2 = strArr3[i];
                    if (str2 == null) {
                        str2 = strArr2[i] + "(" + strArr[i] + ")";
                        strArr3[i] = str2;
                    }
                }
                return str2;
            }
        }
        return str;
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    protected final boolean zza() {
        return false;
    }

    protected final boolean zzb() {
        this.zzs.zzat();
        return this.zzs.zzq() && Log.isLoggable(this.zzs.zzau().zzn(), 3);
    }

    protected final String zzc(String str) {
        if (str == null) {
            return null;
        }
        return !zzb() ? str : zzi(str, zzgr.zzc, zzgr.zza, zza);
    }

    protected final String zzd(String str) {
        if (str == null) {
            return null;
        }
        return !zzb() ? str : zzi(str, zzgs.zzb, zzgs.zza, zzb);
    }

    protected final String zze(String str) {
        if (str == null) {
            return null;
        }
        if (!zzb()) {
            return str;
        }
        if (!str.startsWith("_exp_")) {
            return zzi(str, zzgt.zzb, zzgt.zza, zzc);
        }
        return "experiment_id(" + str + ")";
    }

    protected final String zzf(Bundle bundle) {
        if (bundle == null) {
            return null;
        }
        if (!zzb()) {
            return bundle.toString();
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Bundle[{");
        for (String str : bundle.keySet()) {
            if (sb.length() != 8) {
                sb.append(", ");
            }
            sb.append(zzd(str));
            sb.append("=");
            Object obj = bundle.get(str);
            sb.append(obj instanceof Bundle ? zzh(new Object[]{obj}) : obj instanceof Object[] ? zzh((Object[]) obj) : obj instanceof ArrayList ? zzh(((ArrayList) obj).toArray()) : String.valueOf(obj));
        }
        sb.append("}]");
        return sb.toString();
    }

    protected final String zzh(Object[] objArr) {
        if (objArr == null) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (Object obj : objArr) {
            String strZzf = obj instanceof Bundle ? zzf((Bundle) obj) : String.valueOf(obj);
            if (strZzf != null) {
                if (sb.length() != 1) {
                    sb.append(", ");
                }
                sb.append(strZzf);
            }
        }
        sb.append("]");
        return sb.toString();
    }
}
