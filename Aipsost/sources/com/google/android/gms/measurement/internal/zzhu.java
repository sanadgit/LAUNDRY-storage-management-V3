package com.google.android.gms.measurement.internal;

import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import com.google.firebase.messaging.Constants;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhu implements Runnable {
    final /* synthetic */ boolean zza;
    final /* synthetic */ Uri zzb;
    final /* synthetic */ String zzc;
    final /* synthetic */ String zzd;
    final /* synthetic */ zzhv zze;

    zzhu(zzhv zzhvVar, boolean z, Uri uri, String str, String str2) {
        this.zze = zzhvVar;
        this.zza = z;
        this.zzb = uri;
        this.zzc = str;
        this.zzd = str2;
    }

    @Override // java.lang.Runnable
    public final void run() {
        Bundle bundleZzi;
        Bundle bundleZzi2;
        zzhv zzhvVar = this.zze;
        boolean z = this.zza;
        Uri uri = this.zzb;
        String str = this.zzc;
        String str2 = this.zzd;
        zzhvVar.zza.zzg();
        try {
            if (zzhvVar.zza.zzs.zzc().zzn(null, zzea.zzab) || zzhvVar.zza.zzs.zzc().zzn(null, zzea.zzad) || zzhvVar.zza.zzs.zzc().zzn(null, zzea.zzac)) {
                zzku zzkuVarZzl = zzhvVar.zza.zzs.zzl();
                if (TextUtils.isEmpty(str2)) {
                    bundleZzi = null;
                } else if (str2.contains("gclid") || str2.contains("utm_campaign") || str2.contains("utm_source") || str2.contains("utm_medium")) {
                    String strValueOf = String.valueOf(str2);
                    bundleZzi = zzkuVarZzl.zzi(Uri.parse(strValueOf.length() != 0 ? "https://google.com/search?".concat(strValueOf) : new String("https://google.com/search?")));
                    if (bundleZzi != null) {
                        bundleZzi.putString("_cis", "referrer");
                    }
                } else {
                    zzkuVarZzl.zzs.zzau().zzj().zza("Activity created with data 'referrer' without required params");
                    bundleZzi = null;
                }
            } else {
                bundleZzi = null;
            }
            if (z) {
                bundleZzi2 = zzhvVar.zza.zzs.zzl().zzi(uri);
                if (bundleZzi2 != null) {
                    bundleZzi2.putString("_cis", "intent");
                    if (zzhvVar.zza.zzs.zzc().zzn(null, zzea.zzab) && !bundleZzi2.containsKey("gclid") && bundleZzi != null && bundleZzi.containsKey("gclid")) {
                        bundleZzi2.putString("_cer", String.format("gclid=%s", bundleZzi.getString("gclid")));
                    }
                    zzhvVar.zza.zzs(str, Constants.ScionAnalytics.EVENT_FIREBASE_CAMPAIGN, bundleZzi2);
                    zzhvVar.zza.zzb.zzb(str, bundleZzi2);
                }
            } else {
                bundleZzi2 = null;
            }
            if (zzhvVar.zza.zzs.zzc().zzn(null, zzea.zzad) && !zzhvVar.zza.zzs.zzc().zzn(null, zzea.zzac) && bundleZzi != null && bundleZzi.containsKey("gclid") && (bundleZzi2 == null || !bundleZzi2.containsKey("gclid"))) {
                zzhvVar.zza.zzy(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_lgclid", bundleZzi.getString("gclid"), true);
            }
            if (TextUtils.isEmpty(str2)) {
                return;
            }
            zzhvVar.zza.zzs.zzau().zzj().zzb("Activity created with referrer", str2);
            if (zzhvVar.zza.zzs.zzc().zzn(null, zzea.zzac)) {
                if (bundleZzi != null) {
                    zzhvVar.zza.zzs(str, Constants.ScionAnalytics.EVENT_FIREBASE_CAMPAIGN, bundleZzi);
                    zzhvVar.zza.zzb.zzb(str, bundleZzi);
                } else {
                    zzhvVar.zza.zzs.zzau().zzj().zzb("Referrer does not contain valid parameters", str2);
                }
                zzhvVar.zza.zzy(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_ldl", null, true);
                return;
            }
            if (!str2.contains("gclid") || (!str2.contains("utm_campaign") && !str2.contains("utm_source") && !str2.contains("utm_medium") && !str2.contains("utm_term") && !str2.contains("utm_content"))) {
                zzhvVar.zza.zzs.zzau().zzj().zza("Activity created with data 'referrer' without required params");
            } else {
                if (TextUtils.isEmpty(str2)) {
                    return;
                }
                zzhvVar.zza.zzy(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_ldl", str2, true);
            }
        } catch (RuntimeException e) {
            zzhvVar.zza.zzs.zzau().zzb().zzb("Throwable caught in handleReferrerForOnActivityCreated", e);
        }
    }
}
