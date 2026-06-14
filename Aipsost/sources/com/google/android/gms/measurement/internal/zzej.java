package com.google.android.gms.measurement.internal;

import android.util.Log;
import androidx.exifinterface.media.ExifInterface;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzej implements Runnable {
    final /* synthetic */ int zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ Object zzc;
    final /* synthetic */ Object zzd;
    final /* synthetic */ Object zze;
    final /* synthetic */ zzem zzf;

    zzej(zzem zzemVar, int i, String str, Object obj, Object obj2, Object obj3) {
        this.zzf = zzemVar;
        this.zza = i;
        this.zzb = str;
        this.zzc = obj;
        this.zzd = obj2;
        this.zze = obj3;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzfb zzfbVarZzd = this.zzf.zzs.zzd();
        if (!zzfbVarZzd.zzu()) {
            Log.println(6, this.zzf.zzn(), "Persisted config not initialized. Not logging error/warn");
            return;
        }
        if (this.zzf.zza == 0) {
            if (this.zzf.zzs.zzc().zzh()) {
                zzem zzemVar = this.zzf;
                zzemVar.zzs.zzat();
                zzemVar.zza = 'C';
            } else {
                zzem zzemVar2 = this.zzf;
                zzemVar2.zzs.zzat();
                zzemVar2.zza = 'c';
            }
        }
        if (this.zzf.zzb < 0) {
            zzem zzemVar3 = this.zzf;
            zzemVar3.zzs.zzc().zzf();
            zzem.zzt(zzemVar3, 42004L);
        }
        char cCharAt = "01VDIWEA?".charAt(this.zza);
        char c = this.zzf.zza;
        long j = this.zzf.zzb;
        String strZzo = zzem.zzo(true, this.zzb, this.zzc, this.zzd, this.zze);
        StringBuilder sb = new StringBuilder(String.valueOf(strZzo).length() + 24);
        sb.append(ExifInterface.GPS_MEASUREMENT_2D);
        sb.append(cCharAt);
        sb.append(c);
        sb.append(j);
        sb.append(":");
        sb.append(strZzo);
        String string = sb.toString();
        if (string.length() > 1024) {
            string = this.zzb.substring(0, 1024);
        }
        zzez zzezVar = zzfbVarZzd.zzb;
        if (zzezVar != null) {
            zzezVar.zza(string, 1L);
        }
    }
}
