package com.google.android.gms.internal.p001firebaseauthapi;

import android.content.Context;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Base64;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.logging.Logger;
import com.google.android.gms.common.wrappers.Wrappers;
import com.google.firebase.auth.PhoneAuthCredential;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzyv {
    private static final Logger zza = new Logger("FirebaseAuth", "SmsRetrieverHelper");
    private final Context zzb;
    private final ScheduledExecutorService zzc;
    private final HashMap zzd = new HashMap();

    zzyv(Context context) {
        this.zzb = (Context) Preconditions.checkNotNull(context);
        zzf.zza();
        this.zzc = Executors.unconfigurableScheduledExecutorService(Executors.newScheduledThreadPool(1));
    }

    static String zzb(String str) {
        Matcher matcher = Pattern.compile("(?<!\\d)\\d{6}(?!\\d)").matcher(str);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    static /* bridge */ /* synthetic */ void zze(zzyv zzyvVar, String str) {
        zzyu zzyuVar = (zzyu) zzyvVar.zzd.get(str);
        if (zzyuVar == null || zzag.zzd(zzyuVar.zzd) || zzag.zzd(zzyuVar.zze) || zzyuVar.zzb.isEmpty()) {
            return;
        }
        Iterator it = zzyuVar.zzb.iterator();
        while (it.hasNext()) {
            ((zzxa) it.next()).zzo(PhoneAuthCredential.zzc(zzyuVar.zzd, zzyuVar.zze));
        }
        zzyuVar.zzh = true;
    }

    private static String zzm(String str, String str2) {
        String str3 = str + " " + str2;
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            messageDigest.update(str3.getBytes(zzo.zzc));
            String strSubstring = Base64.encodeToString(Arrays.copyOf(messageDigest.digest(), 9), 3).substring(0, 11);
            zza.d("Package: " + str + " -- Hash: " + strSubstring, new Object[0]);
            return strSubstring;
        } catch (NoSuchAlgorithmException e) {
            zza.e("NoSuchAlgorithm: ".concat(String.valueOf(e.getMessage())), new Object[0]);
            return null;
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzn(String str) {
        zzyu zzyuVar = (zzyu) this.zzd.get(str);
        if (zzyuVar == null || zzyuVar.zzh || zzag.zzd(zzyuVar.zzd)) {
            return;
        }
        zza.w("Timed out waiting for SMS.", new Object[0]);
        Iterator it = zzyuVar.zzb.iterator();
        while (it.hasNext()) {
            ((zzxa) it.next()).zza(zzyuVar.zzd);
        }
        zzyuVar.zzi = true;
    }

    /* JADX INFO: Access modifiers changed from: private */
    /* JADX INFO: renamed from: zzo, reason: merged with bridge method [inline-methods] */
    public final void zzh(String str) {
        zzyu zzyuVar = (zzyu) this.zzd.get(str);
        if (zzyuVar == null) {
            return;
        }
        if (!zzyuVar.zzi) {
            zzn(str);
        }
        zzj(str);
    }

    final String zzc() {
        try {
            String packageName = this.zzb.getPackageName();
            String strZzm = zzm(packageName, (Build.VERSION.SDK_INT < 28 ? Wrappers.packageManager(this.zzb).getPackageInfo(packageName, 64).signatures : Wrappers.packageManager(this.zzb).getPackageInfo(packageName, 134217728).signingInfo.getApkContentsSigners())[0].toCharsString());
            if (strZzm != null) {
                return strZzm;
            }
            zza.e("Hash generation failed.", new Object[0]);
            return null;
        } catch (PackageManager.NameNotFoundException e) {
            zza.e("Unable to find package to obtain hash.", new Object[0]);
            return null;
        }
    }

    final void zzi(zzxa zzxaVar, String str) {
        zzyu zzyuVar = (zzyu) this.zzd.get(str);
        if (zzyuVar == null) {
            return;
        }
        zzyuVar.zzb.add(zzxaVar);
        if (zzyuVar.zzg) {
            zzxaVar.zzb(zzyuVar.zzd);
        }
        if (zzyuVar.zzh) {
            zzxaVar.zzo(PhoneAuthCredential.zzc(zzyuVar.zzd, zzyuVar.zze));
        }
        if (zzyuVar.zzi) {
            zzxaVar.zza(zzyuVar.zzd);
        }
    }

    final void zzj(String str) {
        zzyu zzyuVar = (zzyu) this.zzd.get(str);
        if (zzyuVar == null) {
            return;
        }
        ScheduledFuture scheduledFuture = zzyuVar.zzf;
        if (scheduledFuture != null && !scheduledFuture.isDone()) {
            zzyuVar.zzf.cancel(false);
        }
        zzyuVar.zzb.clear();
        this.zzd.remove(str);
    }

    final void zzk(final String str, zzxa zzxaVar, long j, boolean z) {
        this.zzd.put(str, new zzyu(j, z));
        zzi(zzxaVar, str);
        zzyu zzyuVar = (zzyu) this.zzd.get(str);
        long j2 = zzyuVar.zza;
        if (j2 <= 0) {
            zza.w("Timeout of 0 specified; SmsRetriever will not start.", new Object[0]);
            return;
        }
        zzyuVar.zzf = this.zzc.schedule(new Runnable() { // from class: com.google.android.gms.internal.firebase-auth-api.zzyq
            @Override // java.lang.Runnable
            public final void run() {
                this.zza.zzh(str);
            }
        }, j2, TimeUnit.SECONDS);
        if (!zzyuVar.zzc) {
            zza.w("SMS auto-retrieval unavailable; SmsRetriever will not start.", new Object[0]);
            return;
        }
        zzyt zzytVar = new zzyt(this, str);
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(SmsRetriever.SMS_RETRIEVED_ACTION);
        zzb.zza(this.zzb.getApplicationContext(), zzytVar, intentFilter);
        SmsRetriever.getClient(this.zzb).startSmsRetriever().addOnFailureListener(new zzyr(this));
    }

    final boolean zzl(String str) {
        return this.zzd.get(str) != null;
    }
}
