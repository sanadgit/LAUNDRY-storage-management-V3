package com.google.android.gms.measurement.internal;

import android.util.Pair;
import com.google.android.gms.ads.identifier.AdvertisingIdClient;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.util.Locale;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjl extends zzke {
    public final zzey zza;
    public final zzey zzb;
    public final zzey zzc;
    public final zzey zzd;
    public final zzey zze;
    private String zzg;
    private boolean zzh;
    private long zzi;

    zzjl(zzkn zzknVar) {
        super(zzknVar);
        zzfb zzfbVarZzd = this.zzs.zzd();
        zzfbVarZzd.getClass();
        this.zza = new zzey(zzfbVarZzd, "last_delete_stale", 0L);
        zzfb zzfbVarZzd2 = this.zzs.zzd();
        zzfbVarZzd2.getClass();
        this.zzb = new zzey(zzfbVarZzd2, "backoff", 0L);
        zzfb zzfbVarZzd3 = this.zzs.zzd();
        zzfbVarZzd3.getClass();
        this.zzc = new zzey(zzfbVarZzd3, "last_upload", 0L);
        zzfb zzfbVarZzd4 = this.zzs.zzd();
        zzfbVarZzd4.getClass();
        this.zzd = new zzey(zzfbVarZzd4, "last_upload_attempt", 0L);
        zzfb zzfbVarZzd5 = this.zzs.zzd();
        zzfbVarZzd5.getClass();
        this.zze = new zzey(zzfbVarZzd5, "midnight_offset", 0L);
    }

    @Override // com.google.android.gms.measurement.internal.zzke
    protected final boolean zzaA() {
        return false;
    }

    final Pair<String, Boolean> zzc(String str, zzaf zzafVar) {
        return zzafVar.zzf() ? zzd(str) : new Pair<>("", false);
    }

    @Deprecated
    final Pair<String, Boolean> zzd(String str) {
        zzg();
        long jElapsedRealtime = this.zzs.zzay().elapsedRealtime();
        String str2 = this.zzg;
        if (str2 != null && jElapsedRealtime < this.zzi) {
            return new Pair<>(str2, Boolean.valueOf(this.zzh));
        }
        this.zzi = jElapsedRealtime + this.zzs.zzc().zzj(str, zzea.zza);
        AdvertisingIdClient.setShouldSkipGmsCoreVersionCheck(true);
        try {
            AdvertisingIdClient.Info advertisingIdInfo = AdvertisingIdClient.getAdvertisingIdInfo(this.zzs.zzax());
            this.zzg = "";
            String id = advertisingIdInfo.getId();
            if (id != null) {
                this.zzg = id;
            }
            this.zzh = advertisingIdInfo.isLimitAdTrackingEnabled();
        } catch (Exception e) {
            this.zzs.zzau().zzj().zzb("Unable to get advertising id", e);
            this.zzg = "";
        }
        AdvertisingIdClient.setShouldSkipGmsCoreVersionCheck(false);
        return new Pair<>(this.zzg, Boolean.valueOf(this.zzh));
    }

    @Deprecated
    final String zzf(String str) {
        zzg();
        String str2 = (String) zzd(str).first;
        MessageDigest messageDigestZzN = zzku.zzN();
        if (messageDigestZzN == null) {
            return null;
        }
        return String.format(Locale.US, "%032X", new BigInteger(1, messageDigestZzN.digest(str2.getBytes())));
    }
}
