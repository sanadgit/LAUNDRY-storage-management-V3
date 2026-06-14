package com.google.android.gms.measurement.internal;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.text.TextUtils;
import androidx.core.os.EnvironmentCompat;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.wrappers.InstantApps;
import com.google.android.gms.common.wrappers.Wrappers;
import com.google.android.gms.internal.measurement.zzov;
import com.google.android.gms.internal.measurement.zzqi;
import java.security.MessageDigest;
import java.util.Iterator;
import java.util.List;
import org.checkerframework.checker.nullness.qual.EnsuresNonNull;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzee extends zzf {
    private String zza;
    private String zzb;
    private int zzc;
    private String zzd;
    private String zze;
    private long zzf;
    private final long zzg;
    private List<String> zzh;
    private int zzi;
    private String zzj;
    private String zzk;
    private String zzl;

    zzee(zzfu zzfuVar, long j) {
        super(zzfuVar);
        this.zzg = j;
    }

    @Override // com.google.android.gms.measurement.internal.zzf
    protected final boolean zze() {
        return true;
    }

    @Override // com.google.android.gms.measurement.internal.zzf
    @EnsuresNonNull({"appId", "appStore", "appName", "gmpAppId", "gaAppId"})
    protected final void zzf() {
        String str;
        String string;
        String packageName = this.zzs.zzax().getPackageName();
        PackageManager packageManager = this.zzs.zzax().getPackageManager();
        int i = Integer.MIN_VALUE;
        String installerPackageName = EnvironmentCompat.MEDIA_UNKNOWN;
        String str2 = "Unknown";
        if (packageManager == null) {
            this.zzs.zzau().zzb().zzb("PackageManager is null, app identity information might be inaccurate. appId", zzem.zzl(packageName));
            string = "Unknown";
        } else {
            try {
                installerPackageName = packageManager.getInstallerPackageName(packageName);
            } catch (IllegalArgumentException e) {
                this.zzs.zzau().zzb().zzb("Error retrieving app installer package name. appId", zzem.zzl(packageName));
            }
            if (installerPackageName == null) {
                installerPackageName = "manual_install";
            } else if ("com.android.vending".equals(installerPackageName)) {
                installerPackageName = "";
            }
            try {
                PackageInfo packageInfo = packageManager.getPackageInfo(this.zzs.zzax().getPackageName(), 0);
                if (packageInfo != null) {
                    CharSequence applicationLabel = packageManager.getApplicationLabel(packageInfo.applicationInfo);
                    string = !TextUtils.isEmpty(applicationLabel) ? applicationLabel.toString() : "Unknown";
                    try {
                        str2 = packageInfo.versionName;
                        i = packageInfo.versionCode;
                    } catch (PackageManager.NameNotFoundException e2) {
                        str = str2;
                        str2 = string;
                        this.zzs.zzau().zzb().zzc("Error retrieving package info. appId, appName", zzem.zzl(packageName), str2);
                        string = str2;
                        str2 = str;
                    }
                } else {
                    string = "Unknown";
                }
            } catch (PackageManager.NameNotFoundException e3) {
                str = "Unknown";
            }
        }
        this.zza = packageName;
        this.zzd = installerPackageName;
        this.zzb = str2;
        this.zzc = i;
        this.zze = string;
        this.zzf = 0L;
        boolean z = !TextUtils.isEmpty(this.zzs.zzr()) && "am".equals(this.zzs.zzs());
        int iZzG = this.zzs.zzG();
        switch (iZzG) {
            case 0:
                this.zzs.zzau().zzk().zza("App measurement collection enabled");
                break;
            case 1:
                this.zzs.zzau().zzi().zza("App measurement deactivated via the manifest");
                break;
            case 2:
                this.zzs.zzau().zzk().zza("App measurement deactivated via the init parameters");
                break;
            case 3:
                this.zzs.zzau().zzi().zza("App measurement disabled by setAnalyticsCollectionEnabled(false)");
                break;
            case 4:
                this.zzs.zzau().zzi().zza("App measurement disabled via the manifest");
                break;
            case 5:
                this.zzs.zzau().zzk().zza("App measurement disabled via the init parameters");
                break;
            case 6:
                this.zzs.zzau().zzh().zza("App measurement deactivated via resources. This method is being deprecated. Please refer to https://firebase.google.com/support/guides/disable-analytics");
                break;
            case 7:
                this.zzs.zzau().zzi().zza("App measurement disabled via the global data collection setting");
                break;
            default:
                this.zzs.zzau().zzi().zza("App measurement disabled due to denied storage consent");
                break;
        }
        this.zzj = "";
        this.zzk = "";
        this.zzl = "";
        this.zzs.zzat();
        if (z) {
            this.zzk = this.zzs.zzr();
        }
        try {
            String strZza = zzic.zza(this.zzs.zzax(), "google_app_id", this.zzs.zzv());
            this.zzj = true != TextUtils.isEmpty(strZza) ? strZza : "";
            zzov.zzb();
            if (this.zzs.zzc().zzn(null, zzea.zzag)) {
                Context contextZzax = this.zzs.zzax();
                String strZzv = this.zzs.zzv();
                Preconditions.checkNotNull(contextZzax);
                Resources resources = contextZzax.getResources();
                if (TextUtils.isEmpty(strZzv)) {
                    strZzv = zzfm.zza(contextZzax);
                }
                String strZzb = zzfm.zzb("ga_app_id", resources, strZzv);
                this.zzl = true != TextUtils.isEmpty(strZzb) ? strZzb : "";
                if (!TextUtils.isEmpty(strZza) || !TextUtils.isEmpty(strZzb)) {
                    this.zzk = zzfm.zzb("admob_app_id", resources, strZzv);
                }
            } else if (!TextUtils.isEmpty(strZza)) {
                Context contextZzax2 = this.zzs.zzax();
                String strZzv2 = this.zzs.zzv();
                Preconditions.checkNotNull(contextZzax2);
                Resources resources2 = contextZzax2.getResources();
                if (TextUtils.isEmpty(strZzv2)) {
                    strZzv2 = zzfm.zza(contextZzax2);
                }
                this.zzk = zzfm.zzb("admob_app_id", resources2, strZzv2);
            }
            if (iZzG == 0) {
                this.zzs.zzau().zzk().zzc("App measurement enabled for app package, google app id", this.zza, TextUtils.isEmpty(this.zzj) ? this.zzk : this.zzj);
            }
        } catch (IllegalStateException e4) {
            this.zzs.zzau().zzb().zzc("Fetching Google App Id failed with exception. appId", zzem.zzl(packageName), e4);
        }
        this.zzh = null;
        this.zzs.zzat();
        List<String> listZzq = this.zzs.zzc().zzq("analytics.safelisted_events");
        if (listZzq == null) {
            this.zzh = listZzq;
        } else if (listZzq.size() == 0) {
            this.zzs.zzau().zzh().zza("Safelisted event list is empty. Ignoring");
        } else {
            Iterator<String> it = listZzq.iterator();
            while (it.hasNext()) {
                if (!this.zzs.zzl().zzk("safelisted event", it.next())) {
                }
            }
            this.zzh = listZzq;
        }
        if (packageManager != null) {
            this.zzi = InstantApps.isInstantApp(this.zzs.zzax()) ? 1 : 0;
        } else {
            this.zzi = 0;
        }
    }

    final zzp zzh(String str) {
        long j;
        String str2;
        String str3;
        long jMin;
        long j2;
        zzg();
        String strZzi = zzi();
        String strZzj = zzj();
        zzb();
        String str4 = this.zzb;
        zzb();
        long j3 = this.zzc;
        zzb();
        Preconditions.checkNotNull(this.zzd);
        String str5 = this.zzd;
        this.zzs.zzc().zzf();
        zzb();
        zzg();
        long j4 = this.zzf;
        if (j4 == 0) {
            zzku zzkuVarZzl = this.zzs.zzl();
            Context contextZzax = this.zzs.zzax();
            String packageName = this.zzs.zzax().getPackageName();
            zzkuVarZzl.zzg();
            Preconditions.checkNotNull(contextZzax);
            Preconditions.checkNotEmpty(packageName);
            PackageManager packageManager = contextZzax.getPackageManager();
            MessageDigest messageDigestZzN = zzku.zzN();
            long jZzO = -1;
            if (messageDigestZzN == null) {
                zzkuVarZzl.zzs.zzau().zzb().zza("Could not get MD5 instance");
                j2 = -1;
            } else if (packageManager != null) {
                try {
                    if (zzkuVarZzl.zzW(contextZzax, packageName)) {
                        jZzO = 0;
                    } else {
                        PackageInfo packageInfo = Wrappers.packageManager(contextZzax).getPackageInfo(zzkuVarZzl.zzs.zzax().getPackageName(), 64);
                        if (packageInfo.signatures == null || packageInfo.signatures.length <= 0) {
                            zzkuVarZzl.zzs.zzau().zze().zza("Could not get signatures");
                        } else {
                            jZzO = zzku.zzO(messageDigestZzN.digest(packageInfo.signatures[0].toByteArray()));
                        }
                    }
                    j2 = jZzO;
                } catch (PackageManager.NameNotFoundException e) {
                    zzkuVarZzl.zzs.zzau().zzb().zzb("Package name not found", e);
                    j2 = 0;
                }
            } else {
                j2 = 0;
            }
            this.zzf = j2;
            j = j2;
        } else {
            j = j4;
        }
        boolean zZzF = this.zzs.zzF();
        boolean z = !this.zzs.zzd().zzk;
        zzg();
        if (this.zzs.zzF()) {
            zzqi.zzb();
            if (this.zzs.zzc().zzn(null, zzea.zzai)) {
                this.zzs.zzau().zzk().zza("Disabled IID for tests.");
                str2 = null;
            } else {
                try {
                    Class<?> clsLoadClass = this.zzs.zzax().getClassLoader().loadClass("com.google.firebase.analytics.FirebaseAnalytics");
                    if (clsLoadClass == null) {
                        str2 = null;
                    } else {
                        try {
                            Object objInvoke = clsLoadClass.getDeclaredMethod("getInstance", Context.class).invoke(null, this.zzs.zzax());
                            if (objInvoke == null) {
                                str2 = null;
                            } else {
                                try {
                                    str2 = (String) clsLoadClass.getDeclaredMethod("getFirebaseInstanceId", new Class[0]).invoke(objInvoke, new Object[0]);
                                } catch (Exception e2) {
                                    this.zzs.zzau().zzh().zza("Failed to retrieve Firebase Instance Id");
                                    str2 = null;
                                }
                            }
                        } catch (Exception e3) {
                            this.zzs.zzau().zzf().zza("Failed to obtain Firebase Analytics instance");
                            str2 = null;
                        }
                    }
                } catch (ClassNotFoundException e4) {
                    str2 = null;
                }
            }
        } else {
            str2 = null;
        }
        zzfu zzfuVar = this.zzs;
        long jZza = zzfuVar.zzd().zzc.zza();
        if (jZza == 0) {
            str3 = strZzi;
            jMin = zzfuVar.zzc;
        } else {
            str3 = strZzi;
            jMin = Math.min(zzfuVar.zzc, jZza);
        }
        zzb();
        int i = this.zzi;
        boolean zZzs = this.zzs.zzc().zzs();
        zzfb zzfbVarZzd = this.zzs.zzd();
        zzfbVarZzd.zzg();
        boolean z2 = zzfbVarZzd.zzd().getBoolean("deferred_analytics_collection", false);
        zzb();
        String str6 = this.zzk;
        Boolean boolValueOf = this.zzs.zzc().zzp("google_analytics_default_allow_ad_personalization_signals") == null ? null : Boolean.valueOf(!r2.booleanValue());
        long j5 = this.zzg;
        List<String> list = this.zzh;
        zzov.zzb();
        return new zzp(str3, strZzj, str4, j3, str5, 42004L, j, str, zZzF, z, str2, 0L, jMin, i, zZzs, z2, str6, boolValueOf, j5, list, this.zzs.zzc().zzn(null, zzea.zzag) ? zzl() : null, this.zzs.zzd().zzi().zzd());
    }

    final String zzi() {
        zzb();
        Preconditions.checkNotNull(this.zza);
        return this.zza;
    }

    final String zzj() {
        zzb();
        Preconditions.checkNotNull(this.zzj);
        return this.zzj;
    }

    final String zzk() {
        zzb();
        return this.zzk;
    }

    final String zzl() {
        zzb();
        Preconditions.checkNotNull(this.zzl);
        return this.zzl;
    }

    final int zzm() {
        zzb();
        return this.zzc;
    }

    final int zzn() {
        zzb();
        return this.zzi;
    }

    final List<String> zzo() {
        return this.zzh;
    }
}
